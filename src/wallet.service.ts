import ora from 'ora';
import { loadUser } from './storage.service.js';

import { login } from './auth.service.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants';
import { gridlock } from './gridlock.js';
import { generatePasswordBundle } from './key.service.js';

interface CreateWalletParams {
  email: string;
  password: string;
  blockchain: string;
}

interface SignTransactionParams {
  email: string;
  password: string;
  blockchain: string;
  message: string;
}

export async function createWallet({ email, password, blockchain }: CreateWalletParams) {
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

  const passwordBundle = await generatePasswordBundle({ user, password });
  console.log(passwordBundle); //debug

  // const response = await gridlock.createWallet({ blockchain, user, passwordBundle });
  // if (!response.success) {
  //   spinner.fail(
  //     `Failed to create wallet\nError: ${response.error.message} (Code: ${response.error.code})${
  //       response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''
  //     }`
  //   );
  //   return;
  // }

  spinner.succeed('Wallet created successfully');
  // const wallet = response.data;
  // console.log(
  //   `  ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1).toLowerCase()} - ${
  //     wallet.address
  //   }`
  // );
}

export async function signTransaction({
  email,
  password,
  blockchain,
  message,
}: SignTransactionParams) {
  const user = loadUser({ email });
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
