"use client";
import { useCart } from '../context/CartContext';
import Nav from '../components/NavBar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { initCheckout } from '../api/initCheckout';
import Link from 'next/link';
import useLocalStorage from '../utils/useLocalStorage';

/**
 * Checkout component manages the checkout process, including the countdown timer, domain transfer,
 * and final checkout submission. It checks if the cart has items and if the user is authenticated 
 * before proceeding. The user has a two-minute window to complete the checkout process.
 * 
 * @component
 */
const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { auth } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useLocalStorage<number | null>('CHECKOUT_TIME', null);
  const countdownTime = 120;

  /**
   * Redirects the user to the cart page if the cart is empty, invalid, or the user is not authenticated.
   */
  useEffect(() => {
    if (cart.length === 0 || !auth) {
      router.push('/cart');
    } else if (cart.some(item => item.operationId === '')) {
      router.push('/cart');
    }
  }, [cart, auth, router]);

  /**
   * Calculates the remaining time on the countdown timer.
   */
  useEffect(() => {
    const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
    if (startTime) {
      const elapsedTime = currentTime - startTime;
      const remainingTime = countdownTime - elapsedTime;
      // If time expired, stop the checkout process
      if (remainingTime <= 0) {
        setExpired(true);
        setTimeLeft(0);
        setStartTime(null);
        return;
      }
      // Otherwise, update the time left
      setTimeLeft(remainingTime);
    } else {
      // If no start time, initialize the countdown
      setStartTime(currentTime);
      setTimeLeft(countdownTime);
    }
    /**
     * Interval to update the countdown timer every second.
     */
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setExpired(true);
          setStartTime(null);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    // Cleanup the interval on component unmount or when countdown is finished
    return () => clearInterval(interval);
  }, [startTime, setStartTime, countdownTime]);

  /**
   * Ensures the component is only rendered on the client side.
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate total price of items in the cart
  let total = 0;
  cart.forEach((item) => {
    total += item.suggestion.price.listPrice.usdCents;
  });

  /**
   * Helper function to format remaining time into minutes and seconds.
   * @param {number} seconds - The time in seconds to format.
   * @returns {string} - Formatted time string in 'minutes:seconds' format.
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  /**
   * Executes the checkout process for each item in the cart.
   * It tries to process each domain in the cart and queues the transfer using initCheckout.
   * If any error occurs during the transfer, an error message is set and the process stops.
   * 
   * @returns {Promise<boolean>} - Returns a boolean indicating if the checkout was successful.
   */
  const checkout = async (): Promise<boolean> => {
    try {
      setError('');
      for (const item of cart) {
        try {
            await initCheckout(item.suggestion.name, auth?.idToken.wallet_address!, true, item.operationId!);
          } catch (error) {
            console.error(`Error processing ${item.suggestion.name}:`, error);
            setError(`An unexpected error occurred while processing ${item.suggestion.name}.`);
            return false; // If an error occurs for a domain, return false to halt checkout
          }
      };
      clearCart(); // Clear the cart after successful checkout
      return true; // Return true if all domains are successfully processed
    } catch (error) {
      console.error('Error processing domains:', error);
      setError('An unexpected error occurred. Please try again.');
      return false; // Return false if there's an issue with the overall checkout
    }
  };

  /**
   * Handles the form submission for checkout. It triggers the checkout process
   * and navigates to the order page upon success.
   * 
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Set loading state to true during checkout process
    let success = false;
    try {
      success = await checkout(); // Attempt to process checkout
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Reset loading state after checkout process
      if (success) {
        router.push('/order'); // Navigate to order page upon successful checkout
      }
    }
  }

  // Early return to avoid server-side rendering issues
  if (!isClient) {
    return (
      <section className="w-full h-[100vh] p-[20px] bg-[#1e1e1e] rounded-[8px] overflow-hidden font-inter">
          <Nav />
      </section>
    );
  }

  return (
    <section className="w-full h-[100vh] p-[20px] bg-[#1e1e1e] rounded-[8px] overflow-hidden font-inter">
      <Nav />
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0 pt-5">
        <ol className="items-center flex w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
          <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-primary-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center text-[#007bff] after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
            <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Cart
            </span>
          </li>

          <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-primary-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center text-[#007bff] after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
            <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Checkout
            </span>
          </li>

          <li className="flex shrink-0 items-center">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
            <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Order summary
            </span>
          </li>
        </ol>
        <div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Payment</h2>
          
          <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12">
            <form onSubmit={handleCheckout} action="/order" className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:max-w-xl lg:p-8">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Full name (as displayed on card)* </label>
                  <input type="text" id="full_name" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Partner Engineering" required />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="card-number-input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Card number* </label>
                  <input type="text" id="card-number-input" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="4242424242424242" pattern="^4[0-9]{12}(?:[0-9]{3})?$" required />
                </div>

                <div>
                  <label htmlFor="card-expiration-input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Card expiration* </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
                    <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path
                      fillRule="evenodd"
                      d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                      clipRule="evenodd"
                      />
                    </svg>
                    </div>
                    <input id="card-expiration-input" type="text" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="1234" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="cvv-input" className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">CVV*</label>
                  <input type="number" id="cvv-input" aria-describedby="helper-text-explanation" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="567" required />
                </div>
              </div>

              <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-[#007bff] px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4" disabled={expired}>
                {loading &&
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {expired ? 'Checkout expired' : 'Pay now'}
              </button>
              {error && <div className="text-red-500 text-center mb-[20px]">{error}</div>}
              {expired ?
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Link href='/cart' className="inline-flex items-center gap-2 text-sm font-medium underline hover:no-underline text-[#007bff]">
                    Return to Cart
                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                    </svg>
                  </Link>
                </div>
               : 
               <div className="mt-6 mx-auto text-center text-gray-500 dark:text-gray-400">Checkout time remaining: {formatTime(timeLeft)}</div>
              }
            </form>

            <div className="mt-6 grow sm:mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <dl className="flex items-center justify-between gap-4">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">Subtotal</dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">${(total / 100).toFixed(2)} USD</dd>
                  </dl>
                </div>

                <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">Total</dt>
                  <dd className="text-base font-bold text-gray-900 dark:text-white">${((total) / 100).toFixed(2)} USD</dd>
                </dl>
              </div>
            </div>
          </div>

          <p className="mt-6 mx-auto text-center text-gray-500 dark:text-gray-400 sm:mt-8 lg:text-left">
              This is an entirely fake checkout. You will not be charged. Please do not enter any real credit card information.
          </p>
          { auth && 
            <p className="mt-3 text-sm font-normal text-gray-500 dark:text-gray-400 text-center mx-auto lg:text-left">
              Domain will transfer after checkout to Wallet Address:&nbsp;
              <span className="gap-2 text-sm font-medium text-[#007bff]">
                {auth?.idToken?.sub}&nbsp;
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({auth?.idToken?.wallet_address})
                </span> 
              </span>
            </p>
          }
        </div>
      </div>
    </section>
  );
};

export default Checkout;
