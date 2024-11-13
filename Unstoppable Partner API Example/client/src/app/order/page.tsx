"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Nav from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Order confirmation page component.
 * 
 * This component displays an order summary with a thank-you message. 
 * If the user is not authenticated or has an empty cart, it redirects them to the cart page.
 * 
 * @component
 */
const Order = () => {
  const { cart, clearCart } = useCart();
  const { auth } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

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
   * Ensures the component is only rendered on the client side.
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

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
            <span className="flex items-center text-[#007bff] after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
            <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Order summary
            </span>
          </li>
        </ol>
        <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl mb-2">Thanks for your order!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">Your order <a href="#" className="font-medium text-gray-900 dark:text-white hover:underline">#{Math.floor(100000 + Math.random() * 900000)}</a> will be processed within a few minutes. Keep an eye on your wallet for the domain.</p>
        <div className="w-[75%] space-y-4 sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Date</dt>
            <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{new Date().toLocaleString()}</dd>
          </dl>
          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Payment Method</dt>
            <dd className="font-medium text-gray-900 dark:text-white sm:text-end">Credit Card</dd>
          </dl>
          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Minting Wallet</dt>
            <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{auth?.idToken?.sub}</dd>
          </dl>
        </div>
        <div className="flex items-center space-x-4">
          <Link href='/' onClick={() => clearCart()} className="flex flex-row gap-2 items-center justify-center rounded-lg bg-[#007bff] px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4">
            Return to shopping
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Order;
