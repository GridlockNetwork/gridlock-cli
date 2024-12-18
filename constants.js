import { SUPPORTED_COINS } from 'gridlock-pg-sdk';
import path from 'path';
import os from 'os';

// ACTIONS/COMMANDS
const CREATE_USER = 'create-user';
const SHOW_USER = 'show-user';
const CREATE_WALLET = 'create-wallet';
const LIST_NODES = 'list-nodes';
const SIGN_MESSAGE = 'sign-message';
const SIGN_SERIALIZED_TX = 'sign-serialized-tx';
const SHOW_WALLETS = 'show-wallets';
const DELETE_USER = 'delete-user';
const SHOW_SUPPORTED_COINS = 'show-supported-coins';
const VERIFY_MESSAGE = 'verify-message';
const ADD_GUARDIAN = 'add-guardian';

export const COMMANDS = {
  CREATE_USER,
  SHOW_USER,
  CREATE_WALLET,
  LIST_NODES,
  SIGN_MESSAGE,
  SHOW_WALLETS,
  DELETE_USER,
  SHOW_SUPPORTED_COINS,
  VERIFY_MESSAGE,
  ADD_GUARDIAN,
  SIGN_SERIALIZED_TX,
};
export const ALL_ACTIONS = Object.values(COMMANDS);
export const NO_USER_REQUIRED_ACTIONS = [CREATE_USER, SHOW_SUPPORTED_COINS];
export const WALLET_REQUIRED_ACTIONS = [
  SHOW_WALLETS,
  SIGN_MESSAGE,
  VERIFY_MESSAGE,
  SIGN_SERIALIZED_TX,
];

export const SUPPORTED_COINS_STRING =
  SUPPORTED_COINS.length > 1
    ? `${SUPPORTED_COINS.slice(0, -1).join(', ')} and ${SUPPORTED_COINS.slice(-1)}`
    : SUPPORTED_COINS[0];

const AUTH_DIR = path.join(os.homedir(), '.gridlock-cli');
export const getAuthDataFilePath = (email) => {
  const sanitizedEmail = email.replace(/@/g, '-').replace(/\./g, '_');
  return path.join(AUTH_DIR, `auth_${sanitizedEmail}.json`);
};
