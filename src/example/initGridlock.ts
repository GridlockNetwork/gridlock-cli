import GridlockSdk from 'gridlock-sdk';

const API_KEY = '1234567890'; //API key to access the desired communication network
const BASE_URL = 'http://localhost:3000'; // URL of the orchestration node(s) gateway. Commonly known as the backend server in non-distributed applications
const DEBUG_MODE = false; // Set to true for verbose logging

const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

export default gridlock;
