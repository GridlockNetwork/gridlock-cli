import GridlockSdk from 'gridlock-sdk';

const API_KEY = 'your_api_key_here'; //API key to access the desired communication network
const BASE_URL = 'https://your_base_url_here'; // URL of the orchestration node(s) gateway. Commonly known as the backend server in non-distributed applications
const DEBUG_MODE = true; // Set to true or false based on your preference

const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

export default gridlock;
