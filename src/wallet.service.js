import ora from 'ora';
import { loadUser } from './storage.service.js';
import { login } from './auth.service.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import { gridlock } from '../gridlock.js';

export async function createWallet({ email, password, blockchain }) {
  const user = loadUser({ email });
  if (!user) {
    console.error('User not found');
    return;
  }

  const token = await login({ email, password });
  if (!token) {
    return;
  }

  const spinner = ora('Creating wallet...').start();
  const response = await gridlock.createWallets([blockchain], user);
  if (!response.success) {
    spinner.fail(
      `Failed to create wallet\nError: ${response.error.message} (Code: ${response.error.code})${
        response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''
      }`
    );
    return;
  }

  spinner.succeed('Wallet created successfully');
  const wallet = response.data;
  console.log(
    `  ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1).toLowerCase()} - ${
      wallet.address
    }`
  );
}

export async function signTransaction({ email, password, blockchain, message }) {
  const user = loadUser(email);
  if (!user) {
    console.error('User not found');
    return;
  }
  const token = await login({ email, password });
  if (!token) {
    return;
  }

  const spinner = ora('Signing transaction...').start();
  const response = await gridlock.sign(message, blockchain, user);
  if (!response.success) {
    spinner.fail(
      `Failed to sign transaction\nError: ${response.error.message} (Code: ${response.error.code})${
        response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''
      }`
    );
    return;
  }

  spinner.succeed('Transaction signed successfully');
  const { signature } = response.data;
  console.log(`Signature: ${response.data}`);
}
