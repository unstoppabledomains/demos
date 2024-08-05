# Unstoppable Domains Partner API Example

This project is a demonstration of a basic example of the Unstoppable Domains Partner API. It includes a Node.js server and a Create React App client. It will mint test domains to the Polygon Amoy testnet. This is an example project and should NOT be deployed to production. See `production.md` for details on how to integrate this into your own application. It was made using a node server and create-react-app. This example assumes you have node installed on your local machine and you can run npm commands. 

## Setup Instructions

### 1. Clone the Repository
Change directory into `Unstoppable Domains Partner API Example`

### 2. Install Dependencies
Run the following command to install all dependencies for both the server and the client:
`npm run install:all`

### 3. Request and Add Your Sandbox API Key
Go to the [Partner Dashboard](https://dashboard.auth.unstoppabledomains.com/auth), sign up, create a Sandbox client and request a Sandbox API key.
Add your Sandbox API key to the `server.js` file in the `server` directories.

#### For example:
in `server/server.js`
`const UNSTOPPABLE_SANDBOX_API_KEY = 'PUT YOUR SANDBOX API KEY HERE';`

### 4. Start the Project
Run the following command to start both the server and the client concurrently:
`npm run start`
This will start the Node.js server on port 3001 and the React client on port 3000.

### Development Scripts

#### Install Dependencies for Both Client and Server
`npm run install:all`

#### Start client and server concurrently
`npm run start`

#### Start the Client Only
`npm run start:client`

#### Start the Server Only
`npm run start:server`

### 5. Access the Application
The client will deploy to
`http://localhost:3000`
You should see the Unstoppable Domains Partner API example application running.
