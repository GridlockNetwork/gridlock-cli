import ora from 'ora';
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
  console.log('Entered values:');
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  if (blockchain) console.log(` Blockchain: ${chalk.hex('#4A90E2')(blockchain)}`);
  console.log('\n');

  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email as string;
  }
  if (!password) {
    const answers = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    password = answers.password as string;
  }
  if (!blockchain) {
    const answers = await inquirer.prompt([
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
    ]);
    blockchain = answers.blockchain as string;
  }
  await createWallet({ email, password, blockchain });
};

export const signTransactionInquire = async (options: {
  email?: string;
  password?: string;
  address?: string;
  message?: string;
}) => {
  let { email, password, address, message } = options;
  console.log('Entered values:');
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  if (address) console.log(` Address: ${chalk.hex('#4A90E2')(address)}`);
  if (message) console.log(` Message: ${chalk.hex('#4A90E2')(message)}`);
  console.log('\n');

  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email as string;
  }
  if (!password) {
    const answers = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    password = answers.password as string;
  }
  if (!address) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'address', message: 'Enter the address:' },
    ]);
    address = answers.address as string;
  }
  if (!message) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'message', message: 'Message to be signed:' },
    ]);
    message = answers.message as string;
  }
  await signTransaction({ email, password, address, message });
};

export const verifySignatureInquire = async (options: {
  email?: string;
  password?: string;
  message?: string;
  address?: string;
  signature?: string;
}) => {
  let { email, password, message, address, signature } = options;
  console.log('Entered values:');
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  if (message) console.log(` Message: ${chalk.hex('#4A90E2')(message)}`);
  if (address) console.log(` Address: ${chalk.hex('#4A90E2')(address)}`);
  if (signature) console.log(` Signature: ${chalk.hex('#4A90E2')(signature)}`);
  console.log('\n');

  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email as string;
  }
  if (!password) {
    const answers = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    password = answers.password as string;
  }
  if (!message) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'message', message: 'Message to be verified:' },
    ]);
    message = answers.message as string;
  }
  if (!address) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'address', message: 'Enter the address:' },
    ]);
    address = answers.address as string;
  }
  if (!signature) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'signature', message: 'Enter the signature:' },
    ]);
    signature = answers.signature as string;
  }
  await verifySignature({ email, password, message, address, signature });
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
    const wallet = await gridlock.createWallet({ email, password, blockchain });
    const blockchainCapitalized = blockchain.charAt(0).toUpperCase() + blockchain.slice(1);
    spinner.succeed(`➕ Created ${blockchainCapitalized} wallet with address: ${wallet?.address}`);
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
    spinner.succeed(`Transaction signed successfully with signature: ${signature}`);
  } catch {
    spinner.fail(`Failed to sign transaction`);
  }
}

async function verifySignature({
  email,
  password,
  message,
  address,
  signature,
}: {
  email: string;
  password: string;
  message: string;
  address: string;
  signature: string;
}) {
  const spinner = ora('Verifying signature...').start();
  try {
    const response = await gridlock.verifySignature({
      email,
      password,
      message,
      address,
      signature,
    });
    if (response.verified === true) {
      spinner.succeed(`Signature verified successfully:`);
      console.log(response.verified);

      console.log('      (👍°ヮ°)👍');
    } else {
      spinner.fail(`Invalid signature`);
    }
  } catch {
    spinner.fail(`Failed to verify signature`);
  }
}
