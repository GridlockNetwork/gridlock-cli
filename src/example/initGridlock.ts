import GridlockSdk from 'gridlock-sdk';

const API_KEY = '1234567890'; //API key to access the desired communication network
const BASE_URL = 'http://localhost:5310'; // URL of the orchestration node(s) gateway. Commonly known as the backend server in non-distributed applications
const DEBUG_MODE = false; // Set to true for verbose logging

// Configuration for example usage
export const config = {
  // If true, run the example automatically without waiting for user input between steps
  autoRun: true,
  // SDK configuration
  API_KEY,
  BASE_URL,
  DEBUG_MODE,
};

const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

export default gridlock;
