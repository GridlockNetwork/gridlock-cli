import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import GridlockSdk from 'gridlock-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateKeyPairSync } from 'crypto';
import argon2 from 'argon2';
import crypto from 'crypto';
import {
  SUPPORTED_COINS_STRING,
  API_KEY,
  BASE_URL,
  DEBUG_MODE,
} from './constants.js';
import { SUPPORTED_COINS } from 'gridlock-sdk';
import { log } from 'console';
import nacl from 'tweetnacl';
import { fromSeed } from '@nats-io/nkeys';
import base32 from 'base32.js';
const { Decoder } = base32;


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
const KEYS_DIR = path.join(os.homedir(), '.gridlock-cli', 'keys');

const saveGuardian = (guardian) => {
  if (!fs.existsSync(GUARDIANS_DIR)) {
    fs.mkdirSync(GUARDIANS_DIR, { recursive: true });
  }
  const filePath = path.join(GUARDIANS_DIR, `${guardian.nodeId}.guardian.json`);
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
  const filePath = path.join(USERS_DIR, `${user.email}.user.json`);
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2) + '\n');
};
const loadUser = (email) => {
  const filePath = path.join(USERS_DIR, `${email}.user.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};
const saveTokens = (tokens, email) => {
  if (!fs.existsSync(TOKENS_DIR)) {
    fs.mkdirSync(TOKENS_DIR, { recursive: true });
  }
  const filePath = path.join(TOKENS_DIR, `${email}.tokens.json`);
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2) + '\n');
};
const loadToken = (email, type = 'access') => {
  const filePath = path.join(TOKENS_DIR, `${email}.tokens.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const tokens = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return tokens[type].token;
};
const saveKey = (nodeId, keyObject, type) => {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }
  const checksum = crypto.createHash('sha256').update(JSON.stringify(keyObject)).digest('hex');
  const filePath = path.join(KEYS_DIR, `${nodeId}.${type}.key.json`);
  fs.writeFileSync(filePath, JSON.stringify({ ...keyObject, checksum }, null, 2));
};
const deriveKey = async (password, salt) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
};
const encryptKey = async (key, password) => {
  const salt = crypto.randomBytes(16);
  const derivedKey = await deriveKey(password, salt);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  const encryptedKey = Buffer.concat([cipher.update(key), cipher.final()]);
  const authTag = cipher.getAuthTag();
  key.fill(0);

  return {
    key: encryptedKey.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: salt.toString('base64'),
    algorithm: 'aes-256-gcm',
    createdAt: new Date().toISOString(),
  };
};
const decryptKey = async (encryptedKeyObject, password) => {
  try {
    const { key, iv, authTag, salt } = encryptedKeyObject;
    const derivedKey = await deriveKey(password, Buffer.from(salt, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    const decryptedKey = Buffer.concat([decipher.update(Buffer.from(key, 'base64')), decipher.final()]);
    return decryptedKey;
  } catch (error) {
    console.error('Failed to decrypt key:', error.message);
    throw new Error('Decryption failed. Please check your password and try again.');
  }
};
const generateSigningKey = async (password) => {
  const signingKey = crypto.randomBytes(32);
  return await encryptKey(signingKey, password);
};
const generateIdentityKey = async (password) => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });
  const encryptedPrivateKey = await encryptKey(privateKey, password);
  return { privateKey: encryptedPrivateKey, publicKey: publicKey.toString('base64') };
};
const loadKey = (nodeId, type) => {
  const filePath = path.join(KEYS_DIR, `${nodeId}.${type}.key.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const keyObject = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const { checksum, ...keyData } = keyObject;
  const calculatedChecksum = crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex');
  if (checksum !== calculatedChecksum) {
    throw new Error('Key file integrity check failed. The file may be corrupted or tampered with.');
  }
  return keyData;
};
/**
 * Derives a stronger, unique node-specific key using HKDF.
 * @param {Buffer} signingKey - The encrypted signing key.
 * @param {string} nodeId - The unique node ID.
 * @returns {string} - A unique per-node derived key.
 */
const nodeSigningKey = (signingKey, nodeId) => {
  return crypto.hkdfSync(
    'sha256',                      // Hash function
    signingKey,                    // Input key material
    Buffer.from(nodeId),           // Salt (adds uniqueness)
    Buffer.from('node-auth'),      // Info (context-specific label)
    32                             // Output length (256-bit key)
  ).toString('hex');
};

// ---------------- CLI FUNCTIONS ----------------

let verbose = false;

const guardianTypeMap = {
  'Owner Guardian': 'ownerGuardian',
  'Local Guardian': 'localGuardian',
  'Social Guardian': 'socialGuardian',
  'Cloud Guardian': 'cloudGuardian',
  'Gridlock Guardian': 'gridlockGuardian',
  'Partner Guardian': 'partnerGuardian',
};
const showNetwork = async () => {
  const spinner = ora('Retrieving network status...').start();
  const guardians = loadGuardians();

  spinner.succeed('Network status retrieved successfully');
  console.log(chalk.bold('\n🌐 Guardians in the Network:'));
  console.log('-----------------------------------');

  const guardianGroups = guardians.reduce((acc, guardian) => {
    acc[guardian.type] = acc[guardian.type] || [];
    acc[guardian.type].push(guardian);
    return acc;
  }, {});

  const ownerGuardian = (guardianGroups['ownerGuardian'] || [])[0]; // there can only be one owner guardian
  const localGuardians = guardianGroups['localGuardian'] || [];
  const socialGuardians = guardianGroups['socialGuardian'] || [];
  const cloudGuardians = guardianGroups['cloudGuardian'] || [];
  const gridlockGuardians = guardianGroups['gridlockGuardian'] || [];
  const partnerGuardians = guardianGroups['partnerGuardian'] || [];

  const printGuardians = (title, guardians) => {
    console.log(chalk.bold(`\n${title}:`));
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
  printGuardians('🏡 Local Guardians', localGuardians);
  printGuardians('👥 Social Guardians', socialGuardians);
  printGuardians('🌥️  Cloud Guardians', cloudGuardians);
  printGuardians('🛡️  Gridlock Guardians', gridlockGuardians);
  printGuardians('🤝 Partner Guardians', partnerGuardians);

  console.log('-----------------------------------');
  const threshold = 3;
  const thresholdCheck = guardians.length >= threshold ? chalk.green('✅') : chalk.red('❌');
  console.log(`Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`);
  return;
};
const registerGuardian = async (guardianType, name, nodeId, publicKey, isOwnerGuardian, password, seed) => {
  console.log('Adding guardian...');
  if (!guardianType) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'guardianType',
        message: 'Select the type of guardian to add:',
        choices: [
          // { name: 'Local Guardian', value: 'local' },
          { name: 'Gridlock Guardian', value: 'gridlock' },
          { name: 'Cloud Guardian', value: 'cloud' },
        ],
      },
    ]);
    guardianType = answers.guardianType;
    // console.log('Selected guardian type: ', guardianType);
  }
  if (guardianType === 'local') {
    await registerGuardianLocal(name, isOwnerGuardian, password);
  } else if (guardianType === 'gridlock') {
    await registerGuardianGridlock();
  } else if (guardianType === 'cloud') {
    await registerGuardianCloud(name, nodeId, publicKey, isOwnerGuardian, password, seed);
  } else {
    console.error('Invalid guardian type. Please specify "gridlock" or "cloud".');
  }
};
const registerGuardianLocal = async (name, isOwnerGuardian, password) => {
  if (!name || !isOwnerGuardian || !password) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
      { type: 'confirm', name: 'isOwnerGuardian', message: 'Is this the owner guardian?', default: false },
      { type: 'password', name: 'password', message: 'Enter a password for encrypting the identity key:' },
    ]);
    name = answers.name;
    isOwnerGuardian = answers.isOwnerGuardian;
    password = answers.password;
  }

  const spinner = ora('Adding local guardian...').start();
  const guardians = loadGuardians();
  if (isOwnerGuardian) {
    const ownerGuardians = guardians.filter(g => g.type === 'ownerGuardian');
    if (ownerGuardians.length > 0) {
      console.error('An owner guardian already exists in the database. Delete the existing owner guardian before adding a new one.');
      return;
    }
  }

  const guardian = {
    nodeId: uuidv4(),
    name,
    type: isOwnerGuardian ? 'ownerGuardian' : 'localGuardian',
    active: true,
  };

  // Generate identity key pair for E2E communication, saving the public key to the guardian object, saving the private key encrypted
  const { privateKey, publicKey } = await generateIdentityKey(password);
  guardian.publicKey = publicKey;
  saveKey(guardian.nodeId, { ...privateKey, type: 'identity', description: 'Asymmetric Identity key used for E2E communication' }, 'identity');

  // Generate signing key for ownerGuardian to signing actions
  const encryptedSigningKey = await generateSigningKey(password);
  saveKey(guardian.nodeId, { ...encryptedSigningKey, type: 'signing', description: 'Symmetric Signing key used for signing actions' }, 'signing');


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
  const guardians = response.data;
  spinner.succeed('Gridlock guardians retrieved successfully');
  return guardians;
};
const registerGuardianGridlock = async () => {
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

const registerGuardianCloud = async (name, nodeId, publicKey, isOwnerGuardian, password, seed) => {
  const guardians = loadGuardians();
  if (isOwnerGuardian) {
    const ownerGuardians = guardians.filter(g => g.type === 'ownerGuardian');
    if (ownerGuardians.length > 0) {
      console.error('An owner guardian already exists. Please create a user first.');
      return;
    }
  }
  if (!name || !nodeId || !publicKey || (isOwnerGuardian && !seed)) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
      { type: 'input', name: 'nodeId', message: 'Node ID:' },
      { type: 'input', name: 'publicKey', message: 'Guardian public key:' },
      { type: 'confirm', name: 'isOwnerGuardian', message: 'Is this the owner guardian?', default: false },
      { type: 'password', name: 'password', message: 'Enter a password for encrypting the identity key:' },
    ]);
    name = answers.name;
    nodeId = answers.nodeId;
    publicKey = answers.publicKey;
    isOwnerGuardian = answers.isOwnerGuardian;
    password = answers.password;

    if (isOwnerGuardian) {
      const seedAnswer = await inquirer.prompt([
        { type: 'input', name: 'seed', message: 'Seed (if owner guardian):' },
      ]);
      seed = seedAnswer.seed;
    }
  }

  const spinner = ora('Adding guardian...').start();

  if (isOwnerGuardian) {
    console.log('Seed:', seed); //debug
    const keyPair = fromSeed(Buffer.from(seed, 'utf8'));
    const derivedPublicKey = keyPair.getPublicKey();
    console.log('Derived public key:', derivedPublicKey); //debug
    if (derivedPublicKey !== publicKey) {
      console.error('The provided seed does not match the public key.');
      return;
    }

    try {
      const encryptedSeed = await encryptKey(Buffer.from(seed, 'utf8'), password);
      saveKey(nodeId, { ...encryptedSeed, type: 'identity', description: 'Identity key' }, 'identity');
    } catch (error) {
      console.error('Failed to save private key:', error.message);
      return;
    }

  }

  const guardian = {
    nodeId,
    name,
    type: isOwnerGuardian ? 'ownerGuardian' : 'cloudGuardian',
    active: true,
    publicKey,
  };


  saveGuardian(guardian);

  if (isOwnerGuardian) {

  }

  spinner.succeed('Guardian added successfully');
  await showNetwork();
};

const login = async (email, password) => {
  let token = await loginWithToken(email);
  if (!token) {
    token = await loginWithKey(email, password);
  }

  if (token) {
    saveTokens(token, email);
  }
  return token;
};
const loginWithToken = async (email) => {
  const refreshToken = loadToken(email, 'refresh');
  if (refreshToken) {
    const spinner = ora('Attempting to log in with token...').start();
    const loginResponse = await gridlock.loginWithToken(refreshToken);
    if (loginResponse.success) {
      spinner.succeed('Logged in with token successfully');
      // console.log('payloadddddddddd', loginResponse.data); //debug
      return loginResponse.data.tokens;
    } else {
      spinner.fail(`Failed to log in with token`);
      console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
    }
  }
  return null;
};

const loginWithKey = async (email, password) => {
  const spinner = ora('Attempting to log in with challenge-response...').start();
  const user = loadUser(email);
  if (!user) {
    spinner.fail('User not found.');
    console.error('User not found.');
    return null;
  }

  const { nodeId } = user.ownerGuardian;

  console.log('NodeId debug: ', nodeId); //debug
  const privateKeyObject = loadKey(nodeId, 'identity');
  if (!privateKeyObject) {
    spinner.fail('Owner guardian private key not found.');
    return null;
  }

  const privateKeyBuffer = await decryptKey(privateKeyObject, password);
  const loginResponse = await gridlock.loginWithKey(user, privateKeyBuffer);

  if (loginResponse.success) {
    spinner.succeed('Logged in with challenge-response successfully');
    return loginResponse.data;
  } else {
    spinner.fail('Failed to log in with challenge-response');
    console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
    return null;
  }
};

const createUser = async (name, email, password) => {
  if (!name || !email || !password) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'User name:' },
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'input', name: 'password', message: 'Password:' }, // keep type as input instead of password for demo purposes
    ]);
    name = answers.name;
    email = answers.email;
    password = answers.password;
  }

  const spinner = ora('Creating user...').start();

  const guardians = loadGuardians();
  const ownerGuardian = guardians.find(g => g.type === 'ownerGuardian');
  if (!ownerGuardian) {
    spinner.fail('No owner guardian found. Please add an owner guardian first.');
    return;
  }

  const registerData = {
    name,
    email,
    password,
    ownerGuardian: ownerGuardian,
  };

  const response = await gridlock.createUser(registerData);
  if (!response.success) {
    spinner.fail(`Failed to create user\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
    return;
  }
  const { user, tokens } = response.data;
  saveTokens(tokens, email);
  saveUser(user);
  spinner.succeed(`➕ Created account for user: ${user.name}`);

  // Deregister the owner guardian on success
  await deregisterGuardian(ownerGuardian.nodeId);
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

  myNodeId - uuidv4();
  trustedNodes = [dasfadsfadsfdsa, asdfadsfdsaf, adsfadsfdsf];


  const user = loadUser(email);
  if (!user) {
    console.error('User not found');
    return;
  }

  const token = await login(email, password);
  if (!token) {
    return;
  }

  const spinner = ora('Creating wallet...').start();
  const response = await gridlock.createWallets([blockchain], user);
  if (!response.success) {
    spinner.fail(`Failed to create wallet\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
    return;
  }

  spinner.succeed('Wallet created successfully');
  const wallet = response.data;
  console.log(`  ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1).toLowerCase()} - ${wallet.address}`);

};
const signTransaction = async (email, password, blockchain, message) => {
  if (!email || !password || !blockchain || !message) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'password', name: 'password', message: 'Network access password:' },
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
      { type: 'input', name: 'message', message: 'Message to be signed:' },
    ]);
    email = answers.email;
    password = answers.password;
    blockchain = answers.blockchain;
    message = answers.message;
  }

  const user = loadUser(email);
  if (!user) {
    console.error('User not found');
    return;
  }
  const token = await login(email, password);
  if (!token) {
    return;
  }

  const spinner = ora('Signing transaction...').start();
  const response = await gridlock.sign(message, blockchain, user);
  if (!response.success) {
    spinner.fail(`Failed to sign transaction\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
    return;
  }

  spinner.succeed('Transaction signed successfully');
  const { signature } = response.data;
  console.log(`Signature: ${response.data}`);
};

const addGuardian = async (email, guardianNodeId, password) => {
  if (!email || !guardianNodeId || !password) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'password', name: 'password', message: 'Network access password:' },
    ]);
    email = answers.email;
    password = answers.password;
  }

  const guardians = loadGuardians();
  if (!guardianNodeId) {
    const guardianChoices = guardians.map(g => ({
      name: `${g.name} (${g.nodeId})`,
      value: g.nodeId,
    }));
    const guardianAnswer = await inquirer.prompt([
      { type: 'list', name: 'guardianNodeId', message: 'Select a guardian:', choices: guardianChoices },
    ]);
    guardianNodeId = guardianAnswer.guardianNodeId;
  }

  const spinner = ora('Assigning guardian...').start();
  const token = await login(email, password);
  if (!token) {
    spinner.fail('Login failed.');
    return;
  }

  const guardian = guardians.find(g => g.nodeId === guardianNodeId);

  if (!guardian) {
    spinner.fail('Guardian not found.');

    return;
  }

  try {
    await gridlock.addGuardian(guardian);
    spinner.succeed('Guardian assigned successfully');
  } catch (error) {
    spinner.fail('Failed to assign guardian.');
    console.error('Failed to assign guardian:', error.message);
  }
};

const deregisterGuardian = async (nodeId) => {
  const filePath = path.join(GUARDIANS_DIR, `${nodeId}.guardian.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Guardian ${nodeId} has been assigned to user.`);
  } else {
    console.error(`Guardian with Node ID ${nodeId} not found.`);
  }
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
  .command('register-guardian')
  .description('Register a new guardian that\'s available for user node pool creation.')
  .option('-t, --type <type>', 'Type of guardian (cloud or gridlock)')
  .option('-n, --name <name>', 'Guardian name')
  .option('-o, --owner', 'Is this the owner guardian')
  .option('-p, --password <password>', 'Password for encrypting the identity key')
  .option('-i, --nodeId <nodeId>', 'Node ID')
  .option('-k, --publicKey <publicKey>', 'Guardian public key')
  .option('-s, --seed <seed>', 'Seed (if owner guardian)')
  .action(async (options) => {
    await registerGuardian(options.type, options.name, options.nodeId, options.publicKey, options.owner, options.password, options.seed);
  });

program
  .command('create-user')
  .description('Create a new user')
  .option('-n, --name <name>', 'User name')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .action(async (options) => {
    await createUser(options.name, options.email, options.password);
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
  .option('-m, --message <message>', 'Message to be signed')
  .action(async (options) => {
    await signTransaction(options.email, options.password, options.blockchain, options.message);
  });

program
  .command('add-guardian')
  .description('Add a guardian to a specific user\'s node pool')
  .option('-e, --email <email>', 'User email')
  .option('-g, --guardianNodeId <guardianNodeId>', 'Guardian node ID')
  .option('-p, --password <password>', 'Network access password')
  .action(async (options) => {
    await addGuardian(options.email, options.guardianNodeId, options.password);
  });

program
  .command('deregister-guardian')
  .description('Deregister a guardian by deleting it from the filesystem.')
  .option('-i, --nodeId <nodeId>', 'Node ID of the guardian to deregister')
  .action(async (options) => {
    await deregisterGuardian(options.nodeId);
  });

program
  .command('login')
  .description('Login to the system')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .action(async (options) => {
    const token = await login(options.email, options.password);
    if (token) {
      console.log('Login successful');
    } else {
      console.log('Login failed');
    }
  });

// ---------------- RUN PROGRAM ----------------

await program.parseAsync(process.argv);


