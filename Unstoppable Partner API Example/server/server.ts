import express, { Express, Request, Response } from 'express';
import axios from 'axios';
import path from 'path';
import cors from 'cors';
import { jwtVerify, createRemoteJWKSet } from 'jose';
//import { Low, JSONFile } from 'lowdb';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const UNSTOPPABLE_SANDBOX_API_KEY = process.env.API_KEY_VALUE as string;
const UNSTOPPABLE_SANDBOX_API_URL = process.env.API_URL as string;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req: Request, res: Response) => {
  res.status(500).json('Server is running');
});

app.get('/api/domains', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  try {
    const domains = await searchDomains(query);
    res.json(domains);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching domains', details: error.message });
  }
});

app.post('/api/register', async (req: Request, res: Response) => {
  const domainId = req.body.domainId as string;
  try {
    const register = await registerDomain(domainId);
    if (register.error) {
      res.status(500).json(register);
    } else {
      res.json(register);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error registering domain', details: error.message });
  }
});

app.post('/api/auth/verify', async (req: Request, res: Response) => {
  const auth = req.body.auth;
  const clientId = req.body.clientId as string;
  try {
    const verify = await verifyLogin(auth, clientId);
    if (verify.error) {
      res.status(500).json(verify);
    } else {
      res.json(verify.valid);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error verifying login', details: error.message });
  }
});

app.put('/api/transfer/:domain', async (req: Request, res: Response) => {
  const domain = req.params.domain;
  const walletAddress = req.body.wallet;
  try {
    const domainTransfer = await transferDomain(domain, walletAddress);
    if (domainTransfer.error) {
      res.status(500).json(domainTransfer);
    } else {
      res.json(domainTransfer);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error transferring domain', details: error.message });
  }
});

app.delete('/api/return/:domain', async (req: Request, res: Response) => {
  const domain = req.params.domain;
  try {
    const domainReturn = await returnDomain(domain);
    if (domainReturn.error) {
      res.status(500).json(domainReturn);
    } else {
      res.json(domainReturn);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error returning domain', details: error.message });
  }
});

const searchDomains = async (domainName: string) => {
  try {
    const response = await axios.get(`${UNSTOPPABLE_SANDBOX_API_URL}/suggestions/domains?query=${domainName}`, {
      headers: {
        Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY
      }
    });
    const data = {
      items: response.data.items.map((item: any) => ({
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
  } catch (error: any) {
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

const registerDomain = async (domainId: string) => {
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
  } catch (error: any) {
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

const transferDomain = async (domainId: string, walletAddress: string) => {
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
  } catch (error: any) {
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

const returnDomain = async (domainId: string) => {
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
  } catch (error: any) {
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

const verifyIdToken = async (jwks_uri: string, id_token: string, nonce: string, client_id: string, issuer: string) => {
  const { payload } = await jwtVerify(
    id_token,
    createRemoteJWKSet(new URL(jwks_uri)),
    { audience: client_id, issuer }
  );

  const idToken = payload;

  idToken.__raw = id_token;

  if (nonce !== idToken.nonce) {
    throw new Error('Invalid login credentials!');
  }

  return idToken;
};

const verifyLogin = async (authorization: any, client_id: string) => {
  try {
    const { data } = await axios(
      'https://auth.unstoppabledomains.com/.well-known/openid-configuration'
    );
    const { jwks_uri, issuer } = data;

    const verifyIdTokenResponse = await verifyIdToken(
      jwks_uri,
      authorization.idToken.__raw,
      authorization.idToken.nonce,
      client_id,
      issuer
    );

    const verifyIdTokenSub = verifyIdTokenResponse.sub;

    if (verifyIdTokenSub !== authorization.idToken.sub) {
      console.error('Mismatched Domains');
      return { valid: false, error: 'Mismatched Domains' };
    } else {
      return { valid: true, error: null };
    }
  } catch (error: any) {
    console.error('Error setting up request:', error.message);
    return { valid: false, error: 'Error setting up request', details: error.message };
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
