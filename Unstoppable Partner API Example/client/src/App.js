import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const domainsPerPage = 5;
  const PORT = process.env.API_PORT || 3001

  const searchDomains = async () => {
    try {
      const response = await axios.get(`http://localhost:${PORT}/api/domains?query=${query}`);
      setDomains(response.data);
      setError('');
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching domains:', error);
      setError('Error fetching domains. Please try again.');
    }
  };

  const registerDomain = async () => {
    try {
      const response = await axios.post(`http://localhost:${PORT}/api/register`, {
        domainId: selectedDomain.name,
        wallet: walletAddress
      });

      setSuccessMessage(`You registered ${selectedDomain.name} to ${walletAddress}. Please wait a few minutes for your domain to transfer.`);
      setError('');
      setSelectedDomain(null);
      setWalletAddress('');

    } catch (error) {
      console.error('Error registering domain:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const indexOfLastDomain = currentPage * domainsPerPage;
  const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
  const currentDomains = domains.slice(indexOfFirstDomain, indexOfLastDomain);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <div className="app">
      <header className="header">
        <h1>Unstoppable Domains Partner API Example</h1>
      </header>
      {selectedDomain && (
        <div className="register-container">
          <h2>Register {selectedDomain.name}</h2>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Wallet Address"
            className="input"
          />
          <button onClick={registerDomain} className="button">Register Domain</button>
        </div>
      )}
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for domains..."
          className="input"
        />
        <button onClick={searchDomains} className="button">Search</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <div className="domain-list">
        {currentDomains.map((domain) => (
          <div key={domain.name} className="domain-item">
            <div>
              <p className="domain-name">{domain.name}</p>
              <p className="domain-price">${(domain.price.usdCents / 100).toFixed(2)}</p>
            </div>
            <button onClick={() => setSelectedDomain(domain)} className="button">Select</button>
          </div>
        ))}
      </div>
      <Pagination
        domainsPerPage={domainsPerPage}
        totalDomains={domains.length}
        paginate={paginate}
      />
    </div>
  );
};

const Pagination = ({ domainsPerPage, totalDomains, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalDomains / domainsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination">
      <ul className="pagination-list">
        {pageNumbers.map(number => (
          <li key={number} className="pagination-item">
            <button onClick={() => paginate(number)} className="pagination-button">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default App;
