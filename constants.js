import path from 'path';
import os from 'os';

import { SUPPORTED_COINS } from 'gridlock-sdk';


export const API_KEY = '1234567890'; // Replace with your actual API key
export const BASE_URL = 'https://03a8-2600-100e-a020-5c3-2621-2e15-a1d3-e6ce.ngrok-free.app'; // Replace with your actual base URL

export const MONGO_URI = 'mongodb://root:example@172.18.0.1:27017/'; // Ensure the connection string includes the database name
export const DB_NAME = 'gridlock'; // Database name
export const DEBUG_MODE = false; // set to true for verbose logging, otherwise use the -v flag

export const SUPPORTED_COINS_STRING =
  SUPPORTED_COINS.length > 1
    ? `${SUPPORTED_COINS.slice(0, -1).join(', ')} and ${SUPPORTED_COINS.slice(-1)}`
    : SUPPORTED_COINS[0];

const AUTH_DIR = path.join(os.homedir(), '.gridlock-cli');
export const getAuthDataFilePath = (email) => {
  const sanitizedEmail = email.replace(/@/g, '-').replace(/\./g, '_');
  return path.join(AUTH_DIR, `auth_${sanitizedEmail}.json`);
};