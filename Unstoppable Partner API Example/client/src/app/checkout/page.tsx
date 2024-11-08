"use client";
import { CartProvider, useCart } from '../context/CartContext';
import Link from 'next/link';
import Nav from '../components/NavBar';
import { useState } from 'react';
import { transferDomain } from '../api/transferDomain';
import { useRouter } from 'next/navigation';

const Cart = () => {
  const { cart } = useCart();
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  let total = 0;
  cart.forEach((item) => {
    total += item.price.listPrice.usdCents;
  });

  const checkout = async () => {
    try {
        setError('');
        for (const item of cart) {
            try {
                //await transferDomain(item.name, walletAddress); // Successfull payment
                //await returnDomain(item.name); // Unsuccessfull payment
                await new Promise((resolve) => setTimeout(resolve, 2000));
              } catch (error) {
                console.error(`Error transferring ${item.name}:`, error);
                setError(`An unexpected error occurred while transferring ${item.name}.`);
                continue;
              }
        };
    } catch (error) {
      console.error('Error transferring domains:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };


  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await checkout();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      router.push('/order');
    }
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
                        <input type="text" id="card-number-input" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="4242424242424242" pattern="[0-9]{12}(?:[0-9]{3})?$" required />
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

                    <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-[#007bff] px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4">
                        {loading &&
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        }
                        Pay now
                    </button>
                    {error && <div className="text-red-500 text-center mb-[20px]">{error}</div>}
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
            </div>
        </div>
    </section>
  );
};

export default Cart;
