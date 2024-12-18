// gridlock-cli.js
import { program } from 'commander';
import fs from 'fs';
import GridlockSdk, { SUPPORTED_COINS } from 'gridlock-pg-sdk';
import ora from 'ora';
import qrcode from 'qrcode-terminal';
import * as yup from 'yup';

import path from 'path';

import {
  getAuthDataFilePath,
  COMMANDS,
  SUPPORTED_COINS_STRING,
  WALLET_REQUIRED_ACTIONS,
} from './constants.js';
import { red, green, prettyLog } from './helpers.js';

const verifyOptionCoinType = (options) => {
  const coinTypes = options.coinTypes || [options.coinType];
  const lowerCaseCoinTypes = coinTypes.map((coinType) => coinType.toLowerCase());

  lowerCaseCoinTypes.forEach((coinType) => {
    if (!SUPPORTED_COINS.includes(coinType)) {
      console.error(
        `Invalid coin type: ${coinType}. Supported coin types are: ${SUPPORTED_COINS_STRING}.`
      );
      process.exit(1);
    }
  });

  return lowerCaseCoinTypes.length === 1 ? lowerCaseCoinTypes[0] : lowerCaseCoinTypes;
};

const userSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

// token + nodeId + nodePublicKey
let authData = {};

let user = null;
let userWallets = null;
let gridlock = /** @type {GridlockSdk} */ ({});
let verbose = false;

const initUser = async (email) => {
  let spinner = ora('Initializing...').start();

  const authDataFilePath = getAuthDataFilePath(email);
  if (fs.existsSync(authDataFilePath)) {
    // Ensure the file permissions are set to 600
    fs.chmodSync(authDataFilePath, 0o600);

    authData = JSON.parse(fs.readFileSync(authDataFilePath));
    const { token, nodeId, nodePublicKey, userId } = authData;
    const data = await gridlock.refreshToken(token);

    if (data) {
      authData = { email, userId, token: data.token, nodeId: data.user.nodeId, nodePublicKey: data.user.nodePublicKey };
      saveUserData(authData);
      spinner.succeed('Connected');
      return true;
    } else {
      spinner.fail('Authentication failed');
      return 'Authentication failed';
    }
  } else {
    spinner.fail('No auth data found');
    return 'No auth data found';
  }
};

const saveUserData = (authData) => {
  const authDataFilePath = getAuthDataFilePath(authData.email);
  const dir = path.dirname(authDataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { mode: 0o700 });
  }
  fs.writeFileSync(authDataFilePath, JSON.stringify(authData, null, 2));
  fs.chmodSync(authDataFilePath, 0o600);
};

const initializeSdk = async () => {
  gridlock = new GridlockSdk({
    apiKey: '1234567890',
    baseUrl: 'https://3264-2600-100e-a022-dff3-6f5d-6e0b-576e-5e6f.ngrok-free.app',
    verbose: verbose || false,
  });
};

const logout = () => {
  const authDataFilePath = getAuthDataFilePath(authData.email);
  const spinner = ora('Deleting local data...').start();
  try {
    if (fs.existsSync(authDataFilePath)) {
      fs.unlinkSync(authDataFilePath);
      const dir = path.dirname(authDataFilePath);
      fs.rmdirSync(dir);
    }
    spinner.succeed('Logged out successfully');
  } catch (error) {
    spinner.fail('Failed to logout. Try again');
  }
};

const createUser = async (email, password) => {
  initializeSdk();
  try {
    let data = null;
    await userSchema.validate({ email, password });
    if (user) {
      console.log('User already exists... ');
      data = { user, ...authData };
    } else {
      const spinner = ora('Creating user...').start();
      data = await gridlock.createUser({ email, password });
      if (!data) return spinner.fail('Failed to create user');
      else spinner.succeed('User created successfully');
    }

    user = data.user;
    const userId = data.user._id;
    const token = data.token;
    const nodeId = user.nodeId;
    const nodePublicKey = user.nodePool.find((node) => node.nodeId === nodeId).publicKey;

    if (verbose) {
      console.log('User data:', user);
    } else {
      prettyLog({ email, nodeId, nodePublicKey });
    }

    authData = { email, userId, token, nodeId, nodePublicKey };
    saveUserData(authData);
  } catch (error) {
    if (error.errors) console.error(error.errors.join('\n'));
    else console.error(error.message);
    process.exit(1);
  }
};

const createWallet = async (email, coinTypes) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const plural = coinTypes.length > 1 ? 's' : '';

  const spinner = ora(`Creating ${coinTypes.join(' and ')} wallet${plural}...`).start();

  userWallets = await gridlock.createWallets(coinTypes);

  if (!userWallets) {
    spinner.fail(`Failed to create ${coinTypes} wallet`);
    console.error(`Failed to create ${coinTypes} wallet`);
  } else {
    spinner.succeed(
      `${coinTypes
        .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
        .join(' and ')} wallet${plural} created successfully!`
    );

    userWallets
      .filter((wallet) => coinTypes.find((coinType) => coinType === wallet.coinType))
      .forEach((wallet) => {
        if (verbose) {
          console.log('Wallet details:', wallet);
        } else {
          prettyLog({ coinType: wallet.coinType, address: wallet.address });
        }
      });
  }
};

const signMessage = async (email, message, coinType) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const wallets = await gridlock.getWallets();
  const wallet = wallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora(`Signing message using ${coinType} wallet...`).start();

  const resp = await gridlock.signMessage(message, coinType);

  if (resp && resp.signature) {
    spinner.succeed('Message signed successfully');
    if (verbose) {
      console.log('Signed message response:', resp);
    } else {
      prettyLog({ message, walletAddress: wallet.address, signature: resp.signature });
    }
  } else {
    spinner.fail('Failed to sign message');
  }
};

const verifyMessage = async (email, coinType, message, signature) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const wallets = await gridlock.getWallets();
  const wallet = wallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora('Verifying message...').start();

  const isValid = await gridlock.verifySignature(coinType, message, signature, wallet.address);

  if (isValid === null) {
    spinner.fail('Failed to verify message');
  } else if (!isValid) {
    spinner.fail(`Message is: ${red('Invalid')}`);
  } else {
    spinner.succeed(`Message is: ${green('Valid')}`);
  }

  if (verbose) {
    prettyLog({
      verificationResult: isValid,
      message,
      signature,
      walletAddress: wallet.address,
    });
  }
};

const listNetworkNodes = async (email) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const spinner = ora('Retrieving network nodes...').start();
  const nodes = await gridlock.getNodes();
  if (!nodes) return spinner.fail('Failed to retrieve network nodes');
  spinner.succeed('Network nodes successfully retrieved');
  if (verbose) {
    console.log('Network nodes:', nodes);
  } else {
    console.dir(nodes, { depth: null });
  }
};

const showUserData = async (email) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const spinner = ora('Retrieving user data...').start();
  const user = await gridlock.getUser();
  if (!user) return spinner.fail('Failed to retrieve user data');
  spinner.succeed('User data successfully retrieved');
  if (verbose) {
    console.log('User data:', user);
  } else {
    prettyLog({ email: user.email });
  }
};

const showWallets = async (email) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const spinner = ora('Retrieving wallet data...').start();

  userWallets = await gridlock.getWallets();
  if (!userWallets) {
    spinner.fail('No user wallets found.');
    return;
  }

  if (userWallets.length === 0) {
    spinner.info('No wallets found.');
    return;
  }

  spinner.succeed('Wallet data retrieved successfully');
  if (verbose) {
    console.log('User wallets:', userWallets);
  } else {
    userWallets.forEach((wallet) => {
      prettyLog({ coinType: wallet.coinType, address: wallet.address });
    });
  }
};

const deleteUser = async (email) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const spinner = ora('Deleting user...').start();
  const resp = await gridlock.deleteUser();
  if (!resp) return spinner.fail('Failed to delete user');
  spinner.succeed('User deleted successfully');
  logout();
};

const showSupportedCoins = () => {
  prettyLog(SUPPORTED_COINS, { onlyValues: true });
};

const addGuardian = async (email, name) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const spinner = ora('Adding guardian...').start();
  const data = await gridlock.addUserGuardian({ name });

  if (!data) return spinner.fail('Failed to add guardian');

  const newNode = data.updatedUser.nodePool.find((node) => node.code === data.code);

  if (data.code && newNode) {
    const ownerName = user?.name || user?.email?.split('@')[0];
    const params = {
      mode: 'guardian',
      activationCode: data.code,
      nodePoolId: newNode._id,
      ownerId: user?._id,
      ownerName,
      ownerNodeId: user.nodeId,
    };

    const response = await gridlock.generateGuardianDeeplink(params);
    const deepLink = response?.deepLink;

    if (!deepLink) return spinner.fail('Failed to generate guardian deeplink');
    spinner.succeed('Successfully generated guardian activation link');

    qrcode.generate(deepLink, { small: true });
    console.log('Deep link: ', deepLink);
  }
};

const signTransaction = async (email, transaction, coinType) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  console.warn('WARNING: DEVELOPMENT IN PROGRESS. MIGHT NOT WORK AS EXPECTED');

  const wallets = await gridlock.getWallets();
  const wallet = wallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora(`Signing transaction using ${coinType} wallet...`).start();

  const resp = await gridlock.signSerializedTx(transaction, coinType);
  console.log('resp', resp);

  if (resp && resp.signedTx) {
    spinner.succeed('Transaction signed successfully');
    if (verbose) {
      console.log('Signed transaction response:', resp);
    } else {
      prettyLog({ message, walletAddress: wallet.address, signedTransaction: resp.signedTx });
    }
  } else {
    spinner.fail('Failed to sign transaction');
  }
};

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  const commandName = thisCommand.args[0];
});

program
  .command(COMMANDS.CREATE_USER)
  .description('Create a new user')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-p, --password <password>', 'User password')
  .action((options) => createUser(options.email, options.password));

program
  .command(COMMANDS.SHOW_USER)
  .description('Show data for given user')
  .requiredOption('-e, --email <email>', 'User email')
  .action((options) => showUserData(options.email));

program
  .command(COMMANDS.CREATE_WALLET)
  .description('Create new wallet')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption(
    '-c, --coinTypes <coinTypes...>',
    `Specify the coin type(s) (${SUPPORTED_COINS_STRING})`
  )
  .action((options) => {
    const email = options.email;
    const result = verifyOptionCoinType(options);
    const coinTypes = Array.isArray(result) ? result : [result];

    createWallet(email, coinTypes);
  });

program
  .command(COMMANDS.SHOW_WALLETS)
  .description('Show user wallets')
  .requiredOption('-e, --email <email>', 'User email')
  .action((options) => showWallets(options.email));

program
  .command(COMMANDS.SIGN_MESSAGE)
  .description('Sign a message')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-m, --message <message>', 'Message to sign')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type (${SUPPORTED_COINS_STRING})`)
  .action((options) => {
    const email = options.email;
    const coinType = verifyOptionCoinType(options);
    const message = options.message;

    signMessage(email, message, coinType);
  });

program
  .command(COMMANDS.VERIFY_MESSAGE)
  .description('Verify a signed message')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-m, --message <message>', 'Message to verify')
  .requiredOption('-s, --signature <signature>', 'Signature to verify')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type ${SUPPORTED_COINS_STRING}`)
  .action((options) => {
    const email = options.email;
    const coinType = verifyOptionCoinType(options);

    verifyMessage(email, coinType, options.message, options.signature);
  });

program
  .command(COMMANDS.SIGN_SERIALIZED_TX)
  .description('Sign a serialized transaction (Development in progress)')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-t, --transaction <transaction>', 'Transaction to sign')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type (${SUPPORTED_COINS_STRING})`)
  .action((options) => {
    const email = options.email;
    const coinType = verifyOptionCoinType(options);
    const transaction = options.transaction;

    if (transaction.length === 0) {
      console.error('Message cannot be empty');
      process.exit(1);
    }

    signTransaction(email, transaction, coinType);
  });

program
  .command(COMMANDS.ADD_GUARDIAN)
  .description('Add a guardian')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-n, --name <name>', "Guardian's name")
  .action((options) => {
    const email = options.email;
    const name = options.name;

    if (name.length === 0) {
      console.error('Name cannot be empty');
      process.exit(1);
    }

    addGuardian(email, name);
  });

program
  .command(COMMANDS.LIST_NODES)
  .description('List network nodes')
  .requiredOption('-e, --email <email>', 'User email')
  .action((options) => listNetworkNodes(options.email));

program
  .command(COMMANDS.DELETE_USER)
  .description('Delete current user')
  .requiredOption('-e, --email <email>', 'User email')
  .action((options) => deleteUser(options.email));

program
  .command(COMMANDS.SHOW_SUPPORTED_COINS)
  .description('Show supported coins')
  .action(showSupportedCoins);

program.parse(process.argv);
