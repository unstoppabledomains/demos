# Unstoppable Domains Partner API Example

This guide provides instructions on how to take code from the Unstoppable Domains Partner API example and bring it into production. It was made using a node server and create-react-app. For other tech stacks, the concepts are the same, but you'll need to rewrite the code in your respective language / framework.

## Overview
This example features 2 endpoints from the API
- /domains - 
- /register

## Production Setup Instructions


### 1. Clone the Repository

### 2. Request and Add Your API Key
Go to the [Partner Dashboard](https://dashboard.auth.unstoppabledomains.com/auth), sign up, create a client and request an API key. You can also create a Sandbox client and request an API key for testing
Add your Sandbox API key to the `server.js` file in the `server` directory.

### 3. Configure your environment variables
Example:
```
UNSTOPPABLE_SANDBOX_API_URL = "https://api.ud-sandbox.com/partner/v3"
UNSTOPPABLE_PROD_API_URL = "https://api.unstoppabledomains.com/partner/v3/"
UNSTOPPABLE_SANDBOX_API_KEY = "YOUR SANDBOX KEY" 
UNSTOPPABL_PROD_API_KEY = "YOUR PRODUCTION KEY"
```

### 4. Configure your backend routes
Inside of `server.js` you'll see the following routes declared
```
  app.get('/api/domains', async (req, res) => {
  const query = req.query.query;
  try {
    const domains = await searchDomains(query);
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching domains', details: error.message });}});

app.post('/api/register', async (req, res) => {
  const domainId = req.body.domainId;
  const walletAddress = req.body.wallet;
  try {
    const register = await registerDomain(domainId, walletAddress);
    if (register.error) {
      res.status(500).json(register);
    } else {
      res.json(register);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error registering domain', details: error.message });}});
```
Configure your backend with a get route and a post route

### 5. Configure your backend with the server.js API Calls
Inside of `server.js` you'll see the following API calls 
```
const searchDomains = async (domainName) => {
  try {
    const response = await axios.get(`${UNSTOPPABLE_SANDBOX_API_URL}/suggestions/domains?query=${domainName}`, {
      headers: {
        Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY
      }
    });
    const data = response.data.items.map(item => ({
      name: item.name,
      price: {
        usdCents: item.price.listPrice.usdCents
      }
    }));
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw new Error('Error fetching domains');
  }
};

const registerDomain = async (domainId, walletAddress) => {
  try {
    const response = await axios.post(
      `${UNSTOPPABLE_SANDBOX_API_URL}/domains?query=${domainId}`,
      JSON.stringify({
        name: domainId,
        owner: {
          type: 'EXTERNAL',
          address: walletAddress
        }
      }),
      {
        headers: {
          Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Domain registered:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      return { error: 'Server error', details: error.response.data };
    } else if (error.request) {
      console.error('No response received:', error.request);
      return { error: 'No response received', details: error.request };
    } else {
      console.error('Error setting up request:', error.message);
      return { error: 'Error setting up request', details: error.message };}}};
```
Add these to your backend.

### 6. Update your client and call your backend routes
We suggest 

To get a list of domain suggestions based on search
```
const response = await axios.get(`http://localhost:3001/api/domains?query=${query}`);
```

To register a selected domain
```
const response = await axios.post('http://localhost:3001/api/register', {
        domainId: selectedDomain.name,
        wallet: walletAddress
      });
```
