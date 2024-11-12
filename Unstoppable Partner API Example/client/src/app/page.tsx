"use client";
import React, { useState } from 'react';
import { fetchSuggestions } from './api/fetchSuggestions';
import { Suggestions } from '../types/suggestions';
import Nav from './components/NavBar';
import { useCart } from './context/CartContext';

/**
 * Home component for displaying domain search functionality and managing the cart.
 * Allows users to search for domains, view paginated search results, and add/remove items to/from the cart.
 * 
 * @component
 */
const Home = () => {
  const [query, setQuery] = useState('');
  const [domains, setDomains] = useState<Suggestions | null>(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { cart, addToCart, removeFromCart } = useCart();
  const domainsPerPage = 5;

  /**
   * Fetches domain suggestions based on the current search query.
   * Updates the `domains` state with the response or sets an error message if the fetch fails.
   */
  const searchDomains = async () => {
    try {
      const response = await fetchSuggestions(query);
      setDomains(response!);
      setError('');
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      setError('Error fetching domains. Please try again.');
    }
  };
  
  // Calculate indexes for pagination based on current page
  const indexOfLastDomain = currentPage * domainsPerPage;
  const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
  const currentDomains = domains?.items?.slice(indexOfFirstDomain, indexOfLastDomain);

  /**
   * Sets the current page for pagination.
   * @param {number} pageNumber - The page number to navigate to.
   */
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  /**
   * Handles form submission for domain search.
   * Validates user input, resets domain state, and initiates domain search.
   * 
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inputElement = document.getElementById("search") as HTMLInputElement;
    const inputValue = inputElement.value;
    const isValid = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,22}[a-zA-Z0-9])?$/.test(inputValue);
    
    if (!isValid) {
      setDomains(null);
      setError('Must be 1-24 characters in length, Contain only letters, numbers, or hyphens, and cannot start or end with a hyphen.');
      return;
    }
    setLoading(true);
    try {
      setDomains(null); // Clear previous results
      await searchDomains(); // Fetch new search results
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
      <div className="w-full h-[100vh] p-[20px] bg-[#1e1e1e] rounded-[8px] overflow-hidden font-inter">
        <Nav />
        <form className="max-w-md mx-auto min-w-[400px] pt-[40px] pb-[30px]" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {handleSubmit(e)}}>   
            <div className="relative text-[1.2em] block w-full bg-[#333] rounded-[8px]">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none ">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input type="search" id="search" className="block w-full p-4 ps-10 bg-[#333] placeholder-gray-400 text-white rounded-[8px]" placeholder="Search for your new domain" onChange={(e) => setQuery(e.target.value)} required />
                <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-[#007bff] hover:bg-[#0056b3] font-medium px-4 py-2 rounded-[4px]">Search</button>
            </div>
            <span className='flex text-gray-500 text-center justify-center mt-2'>Must be 1-24 characters in length, Contain only letters, numbers, or hyphens, and cannot start or end with a hyphen.</span>
        </form>
        {error && <div className="text-red-500 text-center mb-[20px]">{error}</div>}
        <div className="flex flex-col items-center">
          {loading &&
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          }
          {currentDomains?.map((domain) => (
            <div key={domain.name} className="flex justify-between items-center w-full max-w-[600px] p-[10px] m-[10px] bg-[#333] rounded-[4px]">
              <div>
                <p className="text-[1.2em] text-white">{domain.name}</p>
                <p className="text-[#bbb]">${(domain.price.listPrice.usdCents / 100).toFixed(2)} USD</p>
              </div>
              {cart.some(cartItem => cartItem.suggestion.name === domain.name)
                ? <button onClick={() => removeFromCart(domain.name)} className="text-[#49a668] text-[1.2em] bg-[#edf7f4] font-medium px-4 py-2 rounded-[4px]">Added</button>
                : <button onClick={() => addToCart(domain)} className="text-white text-[1.2em] bg-[#007bff] hover:bg-[#0056b3] font-medium px-4 py-2 rounded-[4px]">Add to Cart</button>
              }
            </div>
          ))}
        </div>
        <Pagination
          domainsPerPage={domainsPerPage}
          totalDomains={domains?.items?.length || 0}
          paginate={paginate}
        />
      </div>
  );
};

interface PaginationProps {
  domainsPerPage: number;
  totalDomains: number;
  paginate: (pageNumber: number) => void;
}

/**
 * Pagination component to render page numbers for navigating through domain results.
 *
 * @param {number} domainsPerPage - Number of domains displayed per page.
 * @param {number} totalDomains - Total number of domain results.
 * @param {function} paginate - Callback function to change the page number.
 * @returns {JSX.Element} Pagination buttons for navigation.
 */
const Pagination: React.FC<PaginationProps> = ({ domainsPerPage, totalDomains, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalDomains / domainsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center m-[20px]">
      <ul className="flex list-none gap-[10px]">
        {pageNumbers.map(number => (
          <li key={number}>
            <button onClick={() => paginate(number)} className="text-white bg-[#007bff] hover:bg-[#0056b3] font-medium px-[10px] py-[5px] rounded-[4px]">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Home;
