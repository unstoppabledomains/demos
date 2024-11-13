import express, { Express, Request, Response } from 'express';
import axios from 'axios';
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { JSONFile } from 'lowdb/node';
import { Low } from 'lowdb';
import dotenv from 'dotenv';
import { Authorization, Verify } from './types/auth';
import { Suggestions } from './types/suggestions';
import { Operation, Order, Orders } from './types/orders';
import { Transfer, Transfers } from './types/transfers';
import { Return, Returns } from './types/returns';
import { Domains } from './types/domains';

// Load environment variables from .env file
dotenv.config();

// Set up the Express application instance
const app: Express = express();
const port = process.env.PORT || 3001;

// Unstoppable Domains Sandbox API configurations
const UNSTOPPABLE_SANDBOX_API_KEY = process.env.API_KEY_VALUE as string;
const UNSTOPPABLE_SANDBOX_API_URL = process.env.API_URL as string;

// Directory setup for the databases
const __dirname = dirname(fileURLToPath(import.meta.url));

// Default data for databases
const defaultOrderData: Orders = { items: <Order[]>[] }
const defaultTransferData: Transfers = { items: <Transfer[]>[] }
const defaultReturnData: Returns = { items: <Return[]>[] }

// Paths for local JSON databases
const orderDBPath = path.join(__dirname, 'data/orders.json')
const transferDBPath = path.join(__dirname, 'data/transfers.json')
const returnDBPath = path.join(__dirname, 'data/returns.json')

// LowDB instances for each JSON database
const orderDB = new Low(new JSONFile<Orders>(orderDBPath), defaultOrderData);
const transferDB = new Low(new JSONFile<Transfers>(transferDBPath), defaultTransferData);
const returnDB = new Low(new JSONFile<Returns>(returnDBPath), defaultReturnData);

/**
 * Initializes local JSON databases for orders, transfers, and returns.
 * Reads data from the database files and writes default data if none exists.
 */
const initDB = async () => {
  // Initialize Orders database
  await orderDB.read();
  orderDB.data = orderDB.data || defaultOrderData;
  await orderDB.write();

  // Initialize Transfers database
  await transferDB.read();
  transferDB.data = transferDB.data || defaultTransferData;
  await transferDB.write();

  // Initialize Returns database
  await returnDB.read();
  returnDB.data = returnDB.data || defaultReturnData;
  await returnDB.write();
  console.log('Databases initialized');
};

// Initialize the databases on server start
initDB().catch((error) => console.error('Error initializing DB:', error));

/**
 * Initializes tracking for any pending operations in the order, transfer, and return databases.
 * Loads the database data and identifies entries where the `operation.status` is not 'COMPLETED'.
 * For each pending operation, it triggers tracking functions to monitor ongoing processes.
 *
 * @async
 * @function initializeTracking
 * @returns {Promise<void>} - Resolves once all pending operations have been re-tracked.
 */
const initializeTracking = async (): Promise<void> => {
  // Load databases
  await orderDB.read();
  await transferDB.read();
  await returnDB.read();

  // Function to check and track pending operations
  const checkAndTrackPendingOperations = async (db: Low<any>) => {
    // Update according to the appropriate status of the operation
    const pendingItems = db.data?.items?.filter((item: any) => item.operation.status !== 'COMPLETED' && item.operation.status !== 'FAILED') || [];
    for (const item of pendingItems) {
      await trackOperation(item.operation.id, db);
      await trackCheckout(item.operation.id);
    }
  };

  // Check and track pending operations in each database
  await checkAndTrackPendingOperations(orderDB);
  await checkAndTrackPendingOperations(transferDB);
  await checkAndTrackPendingOperations(returnDB);
  console.log('Pending operations re-tracked');
}

// Call initializeTracking when server starts
initializeTracking().catch((error) => console.error('Error initializing tracking:', error));

// Middleware setup
app.use(express.json()); // For parsing JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

/**
 * Root endpoint to verify the server is running.
 */
app.get('/', (req: Request, res: Response) => {
  res.status(500).json('Server is running');
});

/**
 * GET /api/domains - Fetch domain suggestions based on a query string.
 *
 * @query {string} query - The search term for domain suggestions.
 * @returns {Response} - Returns a JSON response with domain suggestions or an error message.
 */
app.get('/api/domains', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  try {
    const domains = await searchDomains(query);
    res.json(domains);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching domains', details: error.message });
  }
});

/**
 * POST /api/register - Registers a domain by its ID.
 *
 * @body {string} domainId - The ID of the domain to be registered.
 * @returns {Response} - Returns a JSON response with registration status or an error message.
 */
app.post('/api/register', async (req: Request, res: Response) => {
  const domainId = req.body.domainId as string;
  try {
    const register = await registerDomain(domainId);
    if (register.error) {
      res.status(500).json(register);
    } else {
      res.json(register);
      await orderDB.update(({ items }) => items.push(register));
      trackOperation(register.operation.id, orderDB);
      trackCheckout(register.operation.id);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error registering domain', details: error.message });
  }
});

/**
 * POST /api/availability - Checks availability of an array of domains.
 *
 * @body {string[]} domains - Array of domains to check availability.
 * @returns {Response} - Returns a JSON response with availability status or an error message.
 */
app.post('/api/availability', async (req: Request, res: Response) => {
  const domains = req.body.domains as string[];
  try {
    const availability = await checkAvailability(domains);
    if (availability.error) {
      res.status(500).json(availability);
    } else {
      res.json(availability);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error checking domain availability', details: error.message });
  }
});

/**
 * POST /api/auth/verify - Verifies the login authorization token.
 *
 * @body {Authorization} auth - Authorization object containing login credentials.
 * @body {string} clientId - The client ID for the verification process.
 * @returns {Response} - Returns a JSON response indicating verification success or an error.
 */
app.post('/api/auth/verify', async (req: Request, res: Response) => {
  const auth = req.body.auth as Authorization;
  const clientId = req.body.clientId as string;
  try {
    const verify = await verifyLogin(auth, clientId);
    if (verify.error) {
      res.status(500).json(verify);
    } else {
      res.json(verify);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Error verifying login', details: error.message });
  }
});

/**
 * POST /api/checkout/:domain - Processes checkout for a domain by updating the order details.
 *
 * @param {string} domain - The domain ID in the URL path.
 * @body {string} wallet - Wallet address for the domain transfer.
 * @body {boolean} payment - Payment confirmation status.
 * @body {string} operationId - Operation ID associated with the checkout.
 * @returns {Response} - Returns a JSON response indicating order processing status.
 */
app.post('/api/checkout/:domain', async (req: Request, res: Response) => {
  const domain = req.params.domain as string;
  const walletAddress = req.body.wallet as string;
  const payment = req.body.payment as boolean;
  const operationId = req.body.operationId as string;
  try {
    await orderDB.read();
    const order = orderDB.data.items.find(order => order.operation.id === operationId);
    if (order) {
      order.walletAddress = walletAddress;
      order.payment = payment;
      await orderDB.write();
    }
    res.json(`Order for domain ${domain} is being processed`);
  } catch (error: any) {
    res.status(500).json({ error: 'Error processing checkout', details: error.message });
  }
});

/**
 * Searches for domain suggestions based on the provided domain name.
 *
 * This function makes an API call to the Unstoppable Domains suggestions endpoint
 * to retrieve a list of suggested domains related to the provided `domainName`.
 * It returns the suggestions data or an error object if the request fails.
 *
 * @param {string} domainName - The domain name query string to search suggestions for.
 * @returns {Promise<Suggestions>} - A promise that resolves to the Suggestions object,
 * containing either the suggestions data or an error object if an error occurs.
 *
 * @throws {Error} - If an error occurs during the API call, this function catches the error
 * and returns an error object with a descriptive message and details about the failure:
 *  - "Server error" if the server responded with an error
 *  - "No response received" if there was no response from the server
 *  - "Error setting up request" if the request could not be configured properly
 */
const searchDomains = async (domainName: string): Promise<Suggestions> => {
  let data = <Suggestions>{};
  try {
    const response = await axios.get(
      `${UNSTOPPABLE_SANDBOX_API_URL}/suggestions/domains?query=${domainName}`, 
      {
        headers: {
          Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY
        }
      }
    );
    console.log('Suggestions:', response.data);
    data = response.data as Suggestions;
    return data
  } catch (error: any) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      data.error = { message: 'Server error', details: error.response.data };
      return data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      data.error = { message: 'No response received', details: error.request };
      return data;
    } else {
      console.error('Error setting up request:', error.message);
      data.error = { message: 'Error setting up request', details: error.message };
      return data;
    }
  }
};

/**
 * Registers a domain with the provided domain ID.
 *
 * This function sends a POST request to the Unstoppable Domains API to register a domain to the default API wallet.
 * On successful registration, it returns the registration details as an `Order` object.
 * If an error occurs, it returns an error object with relevant details.
 *
 * @param {string} domainId - The ID of the domain to register.
 * @returns {Promise<Order>} - A promise that resolves to the `Order` object containing the registration details or an error object.
 *
 * @throws {Error} - If an error occurs, it catches the error and returns an error object with:
 *  - "Server error" if the server responded with an error
 *  - "No response received" if there was no response from the server
 *  - "Error setting up request" if the request configuration failed
 */
const registerDomain = async (domainId: string): Promise<Order> => {
  let data = <Order>{};
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
    data = response.data as Order;
    return data
  } catch (error: any) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      data.error = { message: 'Server error', details: error.response.data };
      return data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      data.error = { message: 'No response received', details: error.request };
      return data;
    } else {
      console.error('Error setting up request:', error.message);
      data.error = { message: 'Error setting up request', details: error.message };
      return data;
    }
  }
};

/**
 * Transfers a domain to a specified wallet address.
 *
 * This function sends a PUT request to the Unstoppable Domains API to transfer ownership
 * of the specified domain to the provided wallet address. It returns the transfer details
 * or an error object in case of a failure.
 *
 * @param {string} domainId - The ID of the domain to transfer.
 * @param {string} walletAddress - The wallet address to transfer the domain ownership to.
 * @returns {Promise<Transfer>} - A promise that resolves to a `Transfer` object with transfer details or an error object.
 *
 * @throws {Error} - If an error occurs, it catches the error and returns an error object with:
 *  - "Server error" if the server responded with an error
 *  - "No response received" if there was no response from the server
 *  - "Error setting up request" if the request configuration failed
 */
const transferDomain = async (domainId: string, walletAddress: string): Promise<Transfer> => {
  let data = <Transfer>{};
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
    data = response.data as Transfer;
    return data
  } catch (error: any) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      data.error = { message: 'Server error', details: error.response.data };
      return data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      data.error = { message: 'No response received', details: error.request };
      return data;
    } else {
      console.error('Error setting up request:', error.message);
      data.error = { message: 'Error setting up request', details: error.message };
      return data;
    }
  }
};

/**
 * Returns a domain to Unstoppable Domains.
 *
 * This function sends a DELETE request to the Unstoppable Domains API to remove
 * the specified domain from the default API wallet and returns it to Unstoppable Domains. 
 * It returns a confirmation or an error object in case of failure. Domains must be returned within 14 days.
 *
 * @param {string} domainId - The ID of the domain to return.
 * @returns {Promise<Return>} - A promise that resolves to a `Return` object with return details or an error object.
 *
 * @throws {Error} - If an error occurs, it catches the error and returns an error object with:
 *  - "Server error" if the server responded with an error
 *  - "No response received" if there was no response from the server
 *  - "Error setting up request" if the request configuration failed
 */
const returnDomain = async (domainId: string): Promise<Return> => {
  let data = <Return>{};
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
    data = response.data as Return;
    return data
  } catch (error: any) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      data.error = { message: 'Server error', details: error.response.data };
      return data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      data.error = { message: 'No response received', details: error.request };
      return data;
    } else {
      console.error('Error setting up request:', error.message);
      data.error = { message: 'Error setting up request', details: error.message };
      return data;
    }
  }
};

/**
 * Checks the status of a domain-related operation.
 *
 * This function sends a GET request to the Unstoppable Domains API to check the
 * status of a given operation by its ID. It returns the operation details or an
 * error object if an error occurs.
 *
 * @param {string} operationId - The ID of the operation to check.
 * @returns {Promise<Operation>} - A promise that resolves to an `Operation` object with status details or an error object.
 *
 * @throws {Error} - If an error occurs, it catches the error and returns an error object with:
 *  - "Server error" if the server responded with an error
 *  - "No response received" if there was no response from the server
 *  - "Error setting up request" if the request configuration failed
 */
const checkOperation = async (operationId: string): Promise<Operation> => {
  let data = <Operation>{};
  try {
    const response = await axios.get(
      `${UNSTOPPABLE_SANDBOX_API_URL}/operations/${operationId}`,
      {
        headers: {
          Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Operation Status:', response.data);
    data = response.data as Operation;
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      data.error = { message: 'Server error', details: error.response.data };
      return data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      data.error = { message: 'No response received', details: error.request };
      return data;
    } else {
      console.error('Error setting up request:', error.message);
      data.error = { message: 'Error setting up request', details: error.message };
      return data;
    }
  }
};

/**
 * Checks the availability of a list of domains.
 *
 * This function sends a GET request to the Unstoppable Domains API to check the
 * availability of a given list of domain names. It returns the domain details or an
 * error object if an error occurs.
 *
 * @param {Array<string>} domains - The ID of the operation to check.
 * @returns {Promise<Domains>} - A promise that resolves to an `Operation` object with status details or an error object.
 *
 * @throws {Error} - If an error occurs, it catches the error and returns an error object with:
 *  - "Server error" if the server responded with an error
 *  - "No response received" if there was no response from the server
 *  - "Error setting up request" if the request configuration failed
 */
const checkAvailability = async (domains: Array<string>): Promise<Domains> => {
  let data = <Domains>{};
  const query = domains.join('&query=');
  try {
    const response = await axios.get(
      `${UNSTOPPABLE_SANDBOX_API_URL}/domains?query=${query}`,
      {
        headers: {
          Authorization: 'Bearer ' + UNSTOPPABLE_SANDBOX_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Domain Availability:', response.data);
    data = response.data as Domains;
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      data.error = { message: 'Server error', details: error.response.data };
      return data;
    } else if (error.request) {
      console.error('No response received:', error.request);
      data.error = { message: 'No response received', details: error.request };
      return data;
    } else {
      console.error('Error setting up request:', error.message);
      data.error = { message: 'Error setting up request', details: error.message };
      return data;
    }
  }
};

/**
 * Verifies an ID token against the provided parameters.
 *
 * This function uses the JSON Web Key Set (JWKS) URI, audience, issuer, and nonce
 * to verify the integrity and validity of the ID token. Returns the token payload
 * if verification is successful.
 *
 * @param {string} jwks_uri - The URI for the JWKS endpoint to validate the token's signature.
 * @param {string} id_token - The ID token to be verified.
 * @param {string} nonce - The nonce value to match against the token's nonce.
 * @param {string} client_id - The client ID that the token is issued for.
 * @param {string} issuer - The issuer of the token.
 * @returns {Promise<any>} - A promise that resolves to the verified token payload.
 *
 * @throws {Error} - If the nonce does not match or the token verification fails.
 */
const verifyIdToken = async (jwks_uri: string, id_token: string, nonce: string, client_id: string, issuer: string): Promise<any> => {
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

/**
 * Verifies a login authorization using OpenID Connect configuration.
 *
 * This function retrieves the OpenID Connect configuration to obtain the JWKS URI and issuer,
 * and then verifies the authorization ID token. Checks the token's subject to ensure it
 * matches the authorization sub value.
 *
 * @param {Authorization} authorization - The authorization object containing the ID token and subject.
 * @param {string} client_id - The client ID for the login verification.
 * @returns {Promise<Verify>} - A promise that resolves to a `Verify` object indicating whether the login is valid.
 */
const verifyLogin = async (authorization: Authorization, client_id: string): Promise<Verify> => {
  try {
    const { data } = await axios(
      'https://auth.unstoppabledomains.com/.well-known/openid-configuration'
    );
    const { jwks_uri, issuer } = data;
    const verifyIdTokenResponse = await verifyIdToken(
      jwks_uri!,
      authorization.idToken.__raw!,
      authorization.idToken.nonce!,
      client_id!,
      issuer!
    );
    const verifyIdTokenSub = verifyIdTokenResponse.sub;
    if (verifyIdTokenSub !== authorization.idToken.sub) {
      console.error('Mismatched Domains');
      return { valid: false, error: 'Mismatched Domains', details: `${verifyIdTokenSub} is not the same as ${authorization.idToken.sub}` } as Verify;
    } else {
      return { valid: true, error: '', details: '' } as Verify;
    }
  } catch (error: any) {
    console.error('Error setting up request:', error.message);
    return { valid: false, error: 'Error setting up request', details: error.message } as Verify;
  }
}

/**
 * Updates an operation in the database with new operation data.
 *
 * Reads the database, searches for an existing operation by its ID, and updates it
 * if found. Writes the updated data back to the database.
 *
 * @param {Operation} operation - The operation data to update in the database.
 * @param {Low<any>} db - The database instance to perform the update.
 * @returns {Promise<void>} - A promise that resolves when the operation is updated.
 */
const updateOperation = async (operation: Operation, db: Low<any>): Promise<void> => {
  await db.read();
  const item = db.data.items.find((item: any) => item.operation.id === operation.id);
  if (item) {
    item.operation = operation;
    await db.write();
  }
};

/**
 * Retrieves the current status of an operation from the database.
 *
 * This function reads the database, searches for an operation by its ID,
 * and returns its status. If the operation is not found, it returns the provided
 * default status.
 *
 * @param {string} operationId - The ID of the operation to retrieve the status for.
 * @param {string} status - The default status to return if the operation is not found.
 * @param {Low<any>} db - The database instance to search.
 * @returns {Promise<string>} - A promise that resolves to the status of the operation.
 */
const getCurrentOperationStatus = async (operationId: string, status: string, db: Low<any>): Promise<string> => {
  await db.read();
  const item = db.data.items.find((item: any) => item.operation.id === operationId);
  if (item) {
    return item.operation.status;
  }
  return status;
};

/**
 * Periodically tracks the status of an operation and updates the database.
 *
 * This function polls the Unstoppable Domains API at a set interval to check the
 * status of a specified operation. If the status changes, it updates the database
 * and stops tracking if the operation completes.
 *
 * @param {string} operationId - The ID of the operation to track.
 * @param {Low<any>} db - The database instance to update with the operation status.
 */
const trackOperation = async (operationId: string, db: Low<any>) => {
  const interval = setInterval(async () => {
    const operation = await checkOperation(operationId);
    const status = await getCurrentOperationStatus(operationId, operation.status, db);
    if (operation.error) {
      console.log('Error:', operation.error);
    } else {
      if (operation.status != status) {
        await updateOperation(operation, db);
        if (operation.status === "COMPLETED") {
          // Handle completed operation
          clearInterval(interval);
        }
        if (operation.status === "FAILED") {
          // Handle failed operation
          clearInterval(interval);
        }
        // You would want to ensure you're handling other status cases here
      }
    }
  }, 60000); // 1 minute timer
};

/**
 * Monitors the checkout process and handles domain transfer or return based on payment status.
 *
 * This function periodically checks the status of an order associated with the provided domain ID.
 * If the order status is "COMPLETED" and payment is successful, it transfers the domain to the user's
 * wallet address. If payment is unsuccessful, it returns the domain to Unstoppable Domains.
 *
 * @param {string} operationId - The ID of the operation to monitor during checkout.
 */
const trackCheckout = async (operationId: string) => {
  const interval = setInterval(async () => {
    await orderDB.read();
    const order = orderDB.data.items.find(order => order.operation.id === operationId);
    if (order) {
      // Successful checkout
      if (order.operation.status === "COMPLETED" && order.walletAddress && order.payment === true) {
        try {
          const domainTransfer = await transferDomain(order.operation.domain, order.walletAddress);
          if (domainTransfer.error) {
            console.log('Error transferring domain:', domainTransfer.error);
            // Handle failed init transfer
          } else {
            console.log('Domain transferred:', domainTransfer);
            // Handle successful init transfer
            clearInterval(interval);
            await transferDB.update(({ items }) => items.push(domainTransfer));
            trackOperation(domainTransfer.operation.id, transferDB);
          }
        } catch (error: any) {
          console.log('Error transferring domain:', error.message);
        }
      // Usuccessful Checkout
      } else if (order.operation.status === "COMPLETED" && order.payment != true) {
        try {
          const domainReturn = await returnDomain(order.operation.domain);
          if (domainReturn.error) {
            console.log('Error returning domain:', domainReturn.error);
            // Handle failed init return
          } else {
            console.log('Domain returned:', domainReturn);
            // Handle successful init return
            clearInterval(interval);
            await returnDB.update(({ items }) => items.push(domainReturn));
            trackOperation(domainReturn.operation.id, returnDB);
          }
        } catch (error: any) {
          console.log('Error returning domain:', error.message);
        }
      }
      // You would want to ensure you're handling other status cases here
    }
  }, 180000); // 3 minute timer
};

/**
 * Starts the Express server and listens on the specified port.
 * Logs a message to the console once the server is running.
 */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
