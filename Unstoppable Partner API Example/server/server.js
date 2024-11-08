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
  try {
    const register = await registerDomain(domainId);
    if (register.error) {
      res.status(500).json(register);
    } else {
      res.json(register);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error registering domain', details: error.message });
  }
});

app.put('/api/transfer/:domain', async (req, res) => {
  const domain = req.params.domain;
  const walletAddress = req.body.wallet;
  try {
    const domainReturn = await transferDomain(domain, walletAddress);
    if (domainReturn.error) {
      res.status(500).json(register);
    } else {
      res.json(domainReturn);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error transferring domain', details: error.message });
  }
});

app.delete('/api/return/:domain', async (req, res) => {
  const domain = req.params.domain;
  try {
    const transfer = await returnDomain(domain);
    if (transfer.error) {
      res.status(500).json(transfer);
    } else {
      res.json(transfer);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error returning domain', details: error.message });
  }
});

const searchDomains = async (domainName) => {
  try {
    const response = await axios.get(`${UNSTOPPABLE_SANDBOX_API_URL}/suggestions/domains?query=${domainName}`, {
      headers: {
        Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY
      }
    });
    const data = {
      items: response.data.items.map(item => ({
        name: item.name,
        price: {
          listPrice: {
            usdCents: item.price.listPrice.usdCents
          }
        }
      }))
    }
    console.log(data);
    return data;
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

const registerDomain = async (domainId) => {
  try {
    const response = await axios.post(
      `${UNSTOPPABLE_SANDBOX_API_URL}/domains?query=${domainId}`,
      JSON.stringify({
        name: domainId,
        records: {}
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

const transferDomain = async (domainId, walletAddress) => {
  try {
    const response = await axios.put(
      `${UNSTOPPABLE_SANDBOX_API_URL}/domains/${domainId}`,
      JSON.stringify({
        name: domainId,
        owner: {
          type: 'EXTERNAL',
          address: walletAddress
        },
        records: {}
      }),
      {
        headers: {
          Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Domain transferred:', response.data);
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

const returnDomain = async (domainId) => {
  try {
    const response = await axios.delete(
      `${UNSTOPPABLE_SANDBOX_API_URL}/domains/${domainId}`,
      {
        headers: {
          Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Domain returned:', response.data);
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
