import ora from 'ora';
import { getEmailandPassword } from './auth.service.js';

import { gridlock } from './gridlock.js';
import inquirer from 'inquirer';
import { SUPPORTED_COINS } from 'gridlock-sdk';
import chalk from 'chalk';

export const createWalletInquire = async (options: {
  email?: string;
  password?: string;
  blockchain?: string;
}) => {
  let { email, password, blockchain } = options;
  if (!email || !password || !blockchain) {
    const credentials = await getEmailandPassword();
    email = credentials.email;
    password = credentials.password;
    const answers = await inquirer.prompt([
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
    ]);
    blockchain = answers.blockchain;
  }
  await createWallet({
    email: email as string,
    password: password as string,
    blockchain: blockchain as string,
  });
};

export const signTransactionInquire = async (options: {
  email?: string;
  password?: string;
  address?: string;
  message?: string;
}) => {
  let { email, password, address, message } = options;
  if (!email || !password || !address || !message) {
    const credentials = await getEmailandPassword();
    email = credentials.email;
    password = credentials.password;
    const answers = await inquirer.prompt([
      { type: 'input', name: 'address', message: 'Select address:' },
      { type: 'input', name: 'message', message: 'Message to be signed:' },
    ]);
    address = answers.address;
    message = answers.message;
  }
  await signTransaction({
    email: email as string,
    password: password as string,
    address: address as string,
    message: message as string,
  });
};

export const verifySignatureInquire = async (options: {
  email?: string;
  password?: string;
  message?: string;
  address?: string;
  blockchain?: string;
  signature?: string;
}) => {
  let { email, password, message, address, blockchain, signature } = options;
  if (!email || !password || !message || !address || !blockchain || !signature) {
    const credentials = await getEmailandPassword();
    email = credentials.email;
    password = credentials.password;
    const answers = await inquirer.prompt([
      { type: 'input', name: 'message', message: 'Message to be verified:' },
      { type: 'input', name: 'address', message: 'Address:' },
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
      { type: 'input', name: 'signature', message: 'Signature:' },
    ]);
    message = answers.message;
    address = answers.address;
    blockchain = answers.blockchain;
    signature = answers.signature;
  }
  await verifySignature({
    email: email as string,
    password: password as string,
    message: message as string,
    address: address as string,
    blockchain: blockchain as string,
    signature: signature as string,
  });
};

async function createWallet({
  email,
  password,
  blockchain,
}: {
  email: string;
  password: string;
  blockchain: string;
}) {
  const spinner = ora('Creating wallet...').start();

  try {
    const wallet = await gridlock.createWallet(email, password, blockchain);
    const blockchainCapitalized = blockchain.charAt(0).toUpperCase() + blockchain.slice(1);
    spinner.succeed(`➕ Created ${blockchainCapitalized} wallet with address:`);
    console.log(wallet?.address); //logging the address of the wallet as standalone to help with automated testing
  } catch {
    spinner.fail(`Failed to create wallet`);
  }
}

async function signTransaction({
  email,
  password,
  address,
  message,
}: {
  email: string;
  password: string;
  address: string;
  message: string;
}) {
  const spinner = ora('Signing transaction...').start();
  try {
    const response = await gridlock.signTransaction({
      email: email,
      password: password,
      address: address,
      message: message,
    });
    const signature = response.signature;
    spinner.succeed(`Transaction signed successfully with signature:`);
    console.log(signature); //logging the signature as standalone to help with automated testing
  } catch {
    spinner.fail(`Failed to sign transaction`);
  }
}

async function verifySignature({
  email,
  password,
  message,
  address,
  blockchain,
  signature,
}: {
  email: string;
  password: string;
  message: string;
  address: string;
  blockchain: string;
  signature: string;
}) {
  const spinner = ora('Verifying signature...').start();
  try {
    const response = await gridlock.verifySignature({
      email,
      password,
      message,
      address,
      blockchain,
      signature,
    });

    if ((response.verified = true)) {
      spinner.succeed(`Signature verified successfully:`);
      console.log(response.verified); //logging the response as standalone to help with automated testing
    } else {
      spinner.fail(`Failed to verify signature`);
    }
  } catch {
    spinner.fail(`Failed to verify signature`);
  }
}
