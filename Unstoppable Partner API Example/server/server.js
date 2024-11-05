const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 3001;
const UNSTOPPABLE_SANDBOX_API_KEY = process.env.API_KEY_VALUE;
const UNSTOPPABLE_SANDBOX_API_URL = process.env.API_URL;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/domains', async (req, res) => {
  const query = req.query.query;
  try {
    const domains = await searchDomains(query);
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching domains', details: error.message });
  }
});

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
    res.status(500).json({ error: 'Error registering domain', details: error.message });
  }
});

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
      return { error: 'Error setting up request', details: error.message };
    }
  }
};

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
