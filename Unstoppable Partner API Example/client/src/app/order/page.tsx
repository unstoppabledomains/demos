"use client";
import { CartProvider, useCart } from '../context/CartContext';
import Link from 'next/link';
import Nav from '../components/NavBar';
import { returnDomain } from '../api/returnDomain';
import { useState } from 'react';

const Cart = () => {
  const { cart, clearCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
                    <span className="flex items-center text-[#007bff] after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
                    <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Order summary
                    </span>
                </li>
            </ol>
            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl mb-2">Thanks for your order!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">Your order <a href="#" className="font-medium text-gray-900 dark:text-white hover:underline">#000000</a> will be processed within a few minutes. Keep an eye on your wallet for the domain.</p>
            <div className="w-[50%] space-y-4 sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                <dl className="sm:flex items-center justify-between gap-4">
                    <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Date</dt>
                    <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{new Date().toLocaleString()}</dd>
                </dl>
                <dl className="sm:flex items-center justify-between gap-4">
                    <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Payment Method</dt>
                    <dd className="font-medium text-gray-900 dark:text-white sm:text-end">Credit Card</dd>
                </dl>
                {loading &&
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
            </div>
            <div className="flex items-center space-x-4">
                <a href="/" onClick={() => clearCart()} className="items-center justify-center rounded-lg bg-[#007bff] px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4">Return to shopping</a>
            </div>
        </div>
    </section>
  );
};

export default Cart;
