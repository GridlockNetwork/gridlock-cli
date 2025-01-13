import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import GridlockSdk from 'gridlock-pg-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateKeyPairSync } from 'crypto';
import {
  SUPPORTED_COINS_STRING,
  API_KEY,
  BASE_URL,
  DEBUG_MODE,
} from './constants.js';
import { SUPPORTED_COINS } from 'gridlock-pg-sdk';
import { log } from 'console';

const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

// ---------------- DATA MANAGEMENT FUNCTIONS -------------------

const GUARDIANS_DIR = path.join(os.homedir(), '.gridlock-cli', 'guardians');
const USERS_DIR = path.join(os.homedir(), '.gridlock-cli', 'users');
const TOKENS_DIR = path.join(os.homedir(), '.gridlock-cli', 'tokens');

const saveGuardian = (guardian) => {
  if (!fs.existsSync(GUARDIANS_DIR)) {
    fs.mkdirSync(GUARDIANS_DIR, { recursive: true });
  }
  const filePath = path.join(GUARDIANS_DIR, `${guardian.nodeId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(guardian, null, 2));
};

const loadGuardians = () => {
  if (!fs.existsSync(GUARDIANS_DIR)) {
    return [];
  }
  return fs.readdirSync(GUARDIANS_DIR).map(file => {
    const filePath = path.join(GUARDIANS_DIR, file);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });
};

const saveUser = (user) => {
  if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
  }
  const filePath = path.join(USERS_DIR, `${user.email}.json`);
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
};

const loadUser = (email) => {
  const filePath = path.join(USERS_DIR, `${email}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const saveToken = (token, email) => {
  if (!fs.existsSync(TOKENS_DIR)) {
    fs.mkdirSync(TOKENS_DIR, { recursive: true });
  }
  const filePath = path.join(TOKENS_DIR, `${email}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ token }, null, 2));
};

const loadToken = (email) => {
  const filePath = path.join(TOKENS_DIR, `${email}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')).token;
};

// ---------------- CLI FUNCTIONS ----------------

let verbose = false;

const guardianTypeMap = {
  'Local Guardian': 'localGuardian',
  'Gridlock Guardian': 'gridlockGuardian',
  'Cloud Guardian': 'cloudGuardian',
  'Owner Guardian': 'ownerGuardian',
};

const showNetwork = async () => {
  const spinner = ora('Retrieving network status...').start();
  const guardians = loadGuardians();

  spinner.succeed('Network status retrieved successfully');
  console.log(chalk.bold('\n🌐 Guardians in the Network:'));
  console.log('-----------------------------------');

  const localGuardians = guardians.filter(g => g.type === 'localGuardian');
  const gridlockGuardians = guardians.filter(g => g.type === 'gridlockGuardian');
  const cloudGuardians = guardians.filter(g => g.type === 'cloudGuardian');
  const ownerGuardian = guardians.find(g => g.type === 'ownerGuardian');

  const printGuardians = (title, guardians) => {
    console.log(chalk.bold(`\n${title}:\n`));
    guardians.forEach((guardian, index) => {
      console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
      console.log(`       ${chalk.bold('Type:')} ${Object.keys(guardianTypeMap).find(key => guardianTypeMap[key] === guardian.type)}`);
      console.log(`       ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
      console.log(`       ${chalk.bold('Public Key:')} ${guardian.publicKey}`);
      const status = guardian.active ? chalk.green('ACTIVE') : chalk.red('INACTIVE');
      console.log(`       ${chalk.bold('Status:')} ${status}`);
      if (index < guardians.length - 1) {
        console.log('       ---');
      }
    });
  };

  ownerGuardian && printGuardians('👑 Owner Guardian', [ownerGuardian]);
  printGuardians('🏡  Local Guardians', localGuardians);
  printGuardians('🌥️  Cloud Guardians', cloudGuardians);
  printGuardians('🛡️  Gridlock Guardians', gridlockGuardians);

  console.log('-----------------------------------');
  const threshold = 3;
  const thresholdCheck = guardians.length >= threshold ? chalk.green('✅') : chalk.red('❌');
  console.log(`Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`);
  return;
};

const addGuardianLocal = async (name, isOwnerGuardian) => {
  if (!name) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
      { type: 'confirm', name: 'isOwnerGuardian', message: 'Is this the owner guardian?', default: false },
    ]);
    name = answers.name;
    isOwnerGuardian = answers.isOwnerGuardian;
  }

  if (isOwnerGuardian) {
    const guardians = loadGuardians();
    const ownerGuardians = guardians.filter(g => g.type === 'ownerGuardian');
    if (ownerGuardians.length > 0) {
      console.error('An owner guardian already exists in the database. Delete the existing owner guardian before adding a new one.');
      return;
    }
  }

  const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  const guardian = {
    nodeId: uuidv4(),
    name,
    type: isOwnerGuardian ? 'ownerGuardian' : 'localGuardian',
    model: 'sdk',
    active: true,
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64'), // Add privateKey to the guardian object
  };

  const spinner = ora('Adding local guardian...').start();
  saveGuardian(guardian);
  spinner.succeed('Local guardian added successfully');
  console.log(chalk.bold('\n➕ New Local Guardian:'));
  console.log(`     ${chalk.bold('Name:')} ${guardian.name}`);
  console.log(`     ${chalk.bold('Type:')} ${Object.keys(guardianTypeMap).find(key => guardianTypeMap[key] === guardian.type)}`);
  console.log(`     ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
  console.log(`     ${chalk.bold('Public Key:')} ${guardian.publicKey}`);

  await showNetwork();
};

const getGridlockGuardian = async () => {
  const spinner = ora('Retrieving Gridlock guardians...').start();
  const response = await gridlock.getGridlockGuardian()
  if (!response.success) {
    spinner.fail('Failed to retrieve Gridlock guardians');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return null;
  }
  const guardians = response.payload;
  spinner.succeed('Gridlock guardians retrieved successfully');
  return guardians;
};

const addGuardianGridlock = async () => {
  const spinner = ora('Retrieving Gridlock guardian...').start();
  const gridlockGuardians = await getGridlockGuardian();
  if (!gridlockGuardians) {
    spinner.fail('Failed to retrieve Gridlock guardians');
    return;
  }

  const existingGuardians = loadGuardians();
  const existingGuardianIds = existingGuardians.map(g => g.nodeId);

  const newGuardian = gridlockGuardians.find(g => !existingGuardianIds.includes(g.nodeId));
  if (!newGuardian) {
    spinner.fail('No new Gridlock guardian available to add');
    return;
  }

  saveGuardian(newGuardian);
  spinner.succeed('Gridlock guardian retrieved and saved successfully');
  await showNetwork();
};

const addGuardianCloud = async (name, nodeId, publicKey) => {
  if (!name || !nodeId || !publicKey) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
      { type: 'input', name: 'nodeId', message: 'Node ID:' },
      { type: 'input', name: 'publicKey', message: 'Guardian public key:' },
    ]);
    name = answers.name;
    nodeId = answers.nodeId;
    publicKey = answers.publicKey;
  }

  const guardian = {
    nodeId,
    name,
    type: 'cloudGuardian',
    active: true,
    publicKey,
  };

  const spinner = ora('Adding guardian...').start();
  saveGuardian(guardian);
  spinner.succeed('Guardian added successfully');
  await showNetwork();
};

const addGuardian = async (guardianType, name, nodeId, publicKey, isOwnerGuardian) => {
  console.log('Adding guardian...');
  if (!guardianType) {
    console.log('no parameters given');
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'guardianType',
        message: 'Select the type of guardian to add:',
        choices: [
          { name: 'Local Guardian', value: 'local' },
          { name: 'Gridlock Guardian', value: 'gridlock' },
          { name: 'Cloud Guardian', value: 'cloud' },
        ],
      },
    ]);
    guardianType = answers.guardianType;
    console.log('Selected guardian type: ', guardianType);
  }

  if (guardianType === 'local') {
    await addGuardianLocal(name, isOwnerGuardian);
  } else if (guardianType === 'gridlock') {
    await addGuardianGridlock();
  } else if (guardianType === 'cloud') {
    await addGuardianCloud(name, nodeId, publicKey);
  } else {
    console.error('Invalid guardian type. Please specify "local", "gridlock", or "cloud".');
  }
};

const createUser = async (email, password) => {
  if (!email || !password) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'input', name: 'password', message: 'Password:' }, //keep type as input instead of password for demo purposes
    ]);
    email = answers.email;
    password = answers.password;
  }

  const spinner = ora('Creating user...').start();

  const guardians = loadGuardians();

  const registerData = {
    email,
    password,
    guardians,
  };

  const response = await gridlock.createUser(registerData);
  if (!response.success) {
    spinner.fail(`Failed to create user\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
    return;
  }
  const { user, token } = response.payload;
  saveToken(token, email);
  saveUser(user);
  spinner.succeed(`➕ Created account for user: ${user.username}`);
};

const createWallet = async (email, password, blockchain) => {
  if (!email || !password || !blockchain) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'password', name: 'password', message: 'Network access password:' },
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
    ]);
    email = answers.email;
    password = answers.password;
    blockchain = answers.blockchain;
  }

  const user = loadUser(email);
  if (!user) {
    console.error('User not found');
    return;
  }

  const token = loadToken(email);
  if (!token) {
    console.error('Token not found for user');
    return;
  }
  //TODO need to move the login functionality to the sdk and just have a single create-wallet call with password/session key
  console.log('Attempting to log in with token...'); //todo remove
  console.log(`Token: ${token}`); //todo remove 
  const loginResponse = await gridlock.loginToken(token);
  if (!loginResponse.success) {
    console.error(`Failed to log in with token\nError: ${loginResponse.error.message} (Code: ${loginResponse.error.code})${loginResponse.raw ? `\nRaw response: ${JSON.stringify(loginResponse.raw)}` : ''}`);
    return;
  }
  const updatedToken = loginResponse.payload.token;
  saveToken(updatedToken, email);
  console.log(loginResponse); //todo remove
  console.log('Successfully logged in with token'); //todo remove

  console.log('Creating wallet for blockchain:', blockchain); // Debug log
  const spinner = ora('Creating wallet...').start();
  const response = await gridlock.createWallets([blockchain]);
  if (!response.success) {
    spinner.fail(`Failed to create wallet\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
    console.error('Raw response:', response.raw); // Debug log
    return;
  }
  console.log('Wallet creation response:', response); // Debug log

  spinner.succeed('Wallet created successfully');
  console.log('responseeeeeeeeeeeeeeeeeeeeeeeeeeee:', response); // Debug log
  const walletList = response.payload.walletList;
  console.log('Wallet List:, walletList:', walletList); // Debug log
  walletList.forEach((wallet, index) => {
    console.log(`${wallet.coinType} Wallet`);
    console.log(`  Blockchain: ${wallet.address}`);
  });
  const wallet = response.payload[0];
  //console.log(`Wallet Address: ${wallet.address}`);
};

const signTransaction = async (email, password, blockchain, action, message) => {
  if (!email || !password || !blockchain || !action || !message) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'password', name: 'password', message: 'Network access password:' },
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
      { type: 'input', name: 'action', message: 'Action type (e.g., sign-msg):' },
      { type: 'input', name: 'message', message: 'Message to be signed:' },
    ]);
    email = answers.email;
    password = answers.password;
    blockchain = answers.blockchain;
    action = answers.action;
    message = answers.message;
  }

  const user = loadUser(email);
  if (!user) {
    console.error('User not found');
    return;
  }

  const token = loadToken(email);
  if (!token) {
    console.error('Token not found for user');
    return;
  }

  console.log('Attempting to log in with token...');
  const loginResponse = await gridlock.loginToken(token);
  if (!loginResponse.success) {
    console.error(`Failed to log in with token\nError: ${loginResponse.error.message} (Code: ${loginResponse.error.code})${loginResponse.raw ? `\nRaw response: ${JSON.stringify(loginResponse.raw)}` : ''}`);
    return;
  }
  const updatedToken = loginResponse.payload.token;
  saveToken(updatedToken, email);
  console.log('Successfully logged in with token');  //todo remove

  const spinner = ora('Signing transaction...').start();
  const response = await gridlock.signMessage(message, blockchain);
  if (!response.success) {
    spinner.fail(`Failed to sign transaction\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
    return;
  }

  spinner.succeed('Transaction signed successfully');
  const { signature } = response.payload;
  console.log(`Signature: ${signature}`);
};
// ---------------- CLI INTERFACE ----------------

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  gridlock.verbose = verbose;
});

program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

program
  .command('show-network')
  .description('Displays the status of all guardians in the network')
  .action(showNetwork);

program
  .command('add-guardian')
  .description('Add a guardian')
  .option('-t, --type <type>', 'Type of guardian (local, cloud, gridlock, partner)')
  .option('-n, --name <name>', 'Guardian name')
  .option('-i, --nodeId <nodeId>', 'Node ID')
  .option('-p, --publicKey <publicKey>', 'Guardian public key')
  .option('-o, --owner', 'Is this the owner guardian')
  .action(async (options) => {
    await addGuardian(options.type, options.name, options.nodeId, options.publicKey, options.owner);
  });

program
  .command('create-user')
  .description('Create a new user')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .action(async (options) => {
    await createUser(options.email, options.password);
  });

program
  .command('create-wallet')
  .description('Create a new wallet')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to create wallet for')
  .action(async (options) => {
    await createWallet(options.email, options.password, options.blockchain);
  });

program
  .command('sign')
  .description('Sign a transaction')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to use')
  .option('-a, --action <action>', 'Action type (e.g., sign-msg)')
  .option('-m, --message <message>', 'Message to be signed')
  .action(async (options) => {
    await signTransaction(options.email, options.password, options.blockchain, options.action, options.message);
  });

// ---------------- RUN PROGRAM ----------------

await program.parseAsync(process.argv);


