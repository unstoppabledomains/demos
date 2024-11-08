"use client";
import { CartProvider, useCart } from '../context/CartContext';
import Link from 'next/link';
import Nav from '../components/NavBar';
import { claimDomain } from '../api/claimDomain';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  let total = 0;
  cart.forEach((item) => {
    total += item.price.listPrice.usdCents;
  });

  const registerDomain = async () => {
    try {
        setError('');
        for (const item of cart) {
          try {
            await claimDomain(item);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`Error registering ${item.name}:`, error);
            setError(`An unexpected error occurred while claiming ${item.name}.`);
            continue;
          }
        };
    } catch (error) {
      console.error('Error registering domains:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await registerDomain();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      router.push('/checkout');
    }
  }

  return (
      <section className="w-full h-[100vh] p-[20px] bg-[#1e1e1e] rounded-[8px] font-inter">
        <Nav />
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0 pt-5">
          <ol className="items-center flex w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base ">
            <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-primary-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
              <span className="flex items-center text-[#007bff] after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
                <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Cart
              </span>
            </li>

            <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-primary-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
              <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
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
          <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Shopping Cart</h2>

          <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
            {cart.length === 0 ? (
              <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-10 mx-auto">
                Your cart is empty.
              </p>
            ) : (
              <div>
                {cart.map((item) => (
                  <div key={item.name} className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl pb-5">
                    <div className="space-y-6">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                        <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                          <svg className="h-20 w-20" focusable="false" aria-hidden="true" viewBox="0 0 40 40">
                            <path d="M38.3333 3.90803V16.5517L1.66666 31.4942L38.3333 3.90803Z" fill="#00C9FF"></path><path d="M31.4583 3.33333V25.1724C31.4583 31.5203 26.3281 36.6667 20 36.6667C13.6719 36.6667 8.54166 31.5203 8.54166 25.1724V15.977L15.4167 12.1839V25.1724C15.4167 26.2394 15.8392 27.2626 16.5913 28.0171C17.3434 28.7716 18.3635 29.1954 19.4271 29.1954C20.4907 29.1954 21.5108 28.7716 22.2629 28.0171C23.015 27.2626 23.4375 26.2394 23.4375 25.1724V7.75862L31.4583 3.33333Z" fill="#0D67FE"></path>
                          </svg>
                          <div className="flex items-center justify-between md:order-3 md:justify-end">
                            <div className="text-end md:order-4 md:w-32">
                              <p className="text-base font-bold text-gray-900 dark:text-white">${(item.price.listPrice.usdCents / 100).toFixed(2)} USD</p>
                            </div>
                          </div>
        
                          <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                            <a href="#" className="text-base font-medium text-gray-900 hover:underline dark:text-white">{item.name}</a>
        
                            <div className="flex items-center gap-4">
                              <button type="button" className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500" onClick={() => removeFromCart(item.name)}>
                                <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href='/cart' onClick={() => clearCart()} className='flex flex-row font-medium text-gray-500 max-w-[120px] max-h-[20px]'>
                  <div className='h-8 w-8'>
                    <svg className="items-center justify-center" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.7535 12.9191L4.50195 12.8708L3.7535 12.9191ZM12.2478 12.9191L11.4994 12.8708V12.8708L12.2478 12.9191ZM1.83398 3.08325C1.41977 3.08325 1.08398 3.41904 1.08398 3.83325C1.08398 4.24747 1.41977 4.58325 1.83398 4.58325V3.08325ZM14.1673 4.58325C14.5815 4.58325 14.9173 4.24747 14.9173 3.83325C14.9173 3.41904 14.5815 3.08325 14.1673 3.08325V4.58325ZM7.25065 7.16659C7.25065 6.75237 6.91486 6.41659 6.50065 6.41659C6.08644 6.41659 5.75065 6.75237 5.75065 7.16659H7.25065ZM5.75065 10.8333C5.75065 11.2475 6.08644 11.5833 6.50065 11.5833C6.91486 11.5833 7.25065 11.2475 7.25065 10.8333H5.75065ZM10.2507 7.16659C10.2507 6.75237 9.91486 6.41659 9.50065 6.41659C9.08644 6.41659 8.75065 6.75237 8.75065 7.16659H10.2507ZM8.75065 10.8333C8.75065 11.2475 9.08644 11.5833 9.50065 11.5833C9.91486 11.5833 10.2507 11.2475 10.2507 10.8333H8.75065ZM9.85699 4.0202C9.96024 4.42134 10.3691 4.66283 10.7703 4.55958C11.1714 4.45633 11.4129 4.04745 11.3096 3.64631L9.85699 4.0202ZM2.41887 3.88154L3.00506 12.9674L4.50195 12.8708L3.91576 3.78497L2.41887 3.88154ZM5.08407 14.9166H10.9172V13.4166H5.08407V14.9166ZM12.9962 12.9674L13.5824 3.88154L12.0855 3.78497L11.4994 12.8708L12.9962 12.9674ZM12.834 3.08325H3.16732V4.58325H12.834V3.08325ZM1.83398 4.58325H3.16732V3.08325H1.83398V4.58325ZM12.834 4.58325H14.1673V3.08325H12.834V4.58325ZM10.9172 14.9166C12.0158 14.9166 12.9255 14.0636 12.9962 12.9674L11.4994 12.8708C11.4796 13.1778 11.2248 13.4166 10.9172 13.4166V14.9166ZM3.00506 12.9674C3.07578 14.0636 3.98555 14.9166 5.08407 14.9166V13.4166C4.77648 13.4166 4.52175 13.1778 4.50195 12.8708L3.00506 12.9674ZM5.75065 7.16659V10.8333H7.25065V7.16659H5.75065ZM8.75065 7.16659V10.8333H10.2507V7.16659H8.75065ZM8.00066 2.58325C8.89273 2.58325 9.64418 3.19336 9.85699 4.0202L11.3096 3.64631C10.9304 2.17284 9.59372 1.08325 8.00066 1.08325V2.58325ZM6.14434 4.0202C6.35715 3.19336 7.1086 2.58325 8.00066 2.58325V1.08325C6.40761 1.08325 5.07093 2.17284 4.69168 3.64631L6.14434 4.0202Z"></path>
                    </svg>
                  </div>
                  <div className='h-auto'>
                    <span>Clear Cart</span>
                  </div>
                </Link>
              </div>
            )}
            {cart.length > 0 &&
              <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-[25%]">
                <div className="space-y-4 rounded-[8px] border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">Order summary</p>

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

                  <form onSubmit={handleCheckout}>
                    <button type="submit" className="flex mx-auto w-[50%] md:w-[40%] items-center justify-center rounded-lg bg-[#007bff] px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                      {loading &&
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      Proceed to Checkout
                    </button>
                  </form>
                  {error && <div className="text-red-500 text-center mb-[20px]">{error}</div>}
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> or </span>
                    <a href="/" title="" className="inline-flex items-center gap-2 text-sm font-medium underline hover:no-underline text-[#007bff]">
                      Continue Shopping
                      <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
  );
};

export default Cart;
