import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

/**
 * Nav component that renders the application header with links to the cart and account information.
 * Displays a loading spinner during client-side hydration.
 *
 * @returns {JSX.Element} The header and navigation elements of the application.
 */
const Nav = () => {
  const { cart } = useCart();
  const { auth, authorizing, login, logout } = useAuth();
  const [isClient, setIsClient] = useState(false); // Tracks client-side rendering status

  /**
   * Initiates the login process for wallet connection.
   */
  const connectWallet = () => {
    try {
      login();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  /**
   * Initiates the logout process to disconnect the wallet.
   */
  const disconnectWallet = () => {
    try {
      logout();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    setIsClient(true); // Set to true once the component has mounted client-side
  }, []);

  // If rendering server-side, display loading state to avoid flash of unhydrated content.
  if (!isClient) {
    return (
      <header className="bg-[#007bff] p-[20px] text-white text-[2em] text-center rounded-[4px] font-helveticaneue flex justify-between items-center">
        <h1>
          <Link href="/">Unstoppable Domains Partner API Example</Link>
        </h1>
        <nav className="flex flex-row space-x-4 font-inter text-lg">
        <div className='h-5 w-5 m-auto'>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          </div>
      </nav>
      </header>
    );
  }

  return (
    <header className="bg-[#007bff] p-[20px] text-white text-[2em] text-center rounded-[4px] font-helveticaneue flex justify-between items-center">
      <h1>
        <Link href="/">Unstoppable Domains Partner API Example</Link>
      </h1>
      <nav className="flex flex-row space-x-4 font-inter text-lg">
        <Link href="/cart" className='flex flex-row m-auto h-10 w-150'>
          <div className='h-5 w-5 m-auto'>
            <svg className=" items-center justify-center" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className='h-auto m-auto pl-1 font-inter'>
            <span>Cart ({cart.length})</span>
          </div>
        </Link>
        {auth ? 
          <button type="button" onClick={() => disconnectWallet()} className="flex flex-row m-auto h-10 w-150">
            <div className='h-5 w-5 m-auto'>
              <svg className="items-center justify-center" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>     
            </div>
            <div className='h-auto m-auto pl-1 font-inter'>
              <span>{auth.idToken.sub}</span>
            </div>
          </button>
        : <button type="button" onClick={() => connectWallet()} className="flex flex-row m-auto h-10 w-150">
            
            <div className='h-5 w-5 m-auto'>
              {authorizing ?
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              : <svg className="items-center justify-center" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            </div>
            <div className='h-auto m-auto pl-1 font-inter'>
              <span>Account</span>
            </div>
          </button>
        }
      </nav>
    </header>
  );
};

export default Nav;
