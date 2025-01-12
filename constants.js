import { SUPPORTED_COINS } from 'gridlock-pg-sdk';

export const API_KEY = '1234567890'; // Replace with your actual API key
export const BASE_URL = 'https://5074-2600-100e-a020-5c3-5d3d-c879-f9b8-7888.ngrok-free.app'; // Replace with your actual base URL

export const MONGO_URI = 'mongodb://root:example@172.18.0.1:27017/'; // Ensure the connection string includes the database name
export const DB_NAME = 'gridlock'; // Database name
export const DEBUG_MODE = false; // set to true for verbose logging, otherwise use the -v flag

export const SUPPORTED_COINS_STRING =
  SUPPORTED_COINS.length > 1
    ? `${SUPPORTED_COINS.slice(0, -1).join(', ')} and ${SUPPORTED_COINS.slice(-1)}`
    : SUPPORTED_COINS[0];
