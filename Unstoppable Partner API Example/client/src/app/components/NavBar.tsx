// components/Header.tsx
import Link from 'next/link';
import { useCart } from '../context/CartContext';

const Nav = () => {
  const { cart } = useCart();

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
          <div className='h-auto m-auto pl-1'>
            <span>Cart ({cart.length})</span>
          </div>
        </Link>
      </nav>
    </header>
  );
};

export default Nav;
