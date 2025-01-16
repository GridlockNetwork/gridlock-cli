// gridlock-cli.js
import { program } from 'commander';
import fs from 'fs';
import GridlockSdk, { SUPPORTED_COINS } from 'gridlock-sdk';
import ora from 'ora';
import qrcode from 'qrcode-terminal';
import * as yup from 'yup';

import path from 'path';

import {
  getAuthDataFilePath,
  COMMANDS,
  SUPPORTED_COINS_STRING,
  WALLET_REQUIRED_ACTIONS,
} from './old_constants.js';
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

    const response = await gridlock.loginToken(token);

    if (response.success) {
      const payload = response.payload;
      authData = { email, userId, token: payload.token, nodeId: payload.user.nodeId, nodePublicKey: payload.user.nodePublicKey };
      saveUserData(authData);
      spinner.succeed('Connected');
      return true;
    } else {
      spinner.fail('Authentication failed');
      console.log('response', response);
      console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
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
    baseUrl: 'https://44d9-2600-100e-a022-dff3-1ad7-275a-7700-eb6c.ngrok-free.app',
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
    await userSchema.validate({ email, password });
    const spinner = ora('Creating user...').start();
    const response = await gridlock.createUser({ email, password });

    if (!response.success) {
      spinner.fail('Failed to create user');
      console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
      return;
    }

    spinner.succeed('User created successfully');
    const { user, token } = response.payload;
    const nodeId = user.nodeId;
    const nodePublicKey = user.nodePool.find((node) => node.nodeId === nodeId).publicKey;

    if (verbose) {
      console.log('User data:', user);
    } else {
      prettyLog({ email, nodeId, nodePublicKey });
    }

    authData = { email, userId: user._id, token, nodeId, nodePublicKey };
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

  const response = await gridlock.createWallets(coinTypes);

  if (!response.success) {
    spinner.fail(`Failed to create ${coinTypes} wallet`);
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
  } else {
    const userWallets = response.data;
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

const gridlockSdk = new GridlockSdk({
  apiKey: '1234567890',
  baseUrl: 'https://44d9-2600-100e-a022-dff3-1ad7-275a-7700-eb6c.ngrok-free.app',
  verbose: false,
});

const signMessage = async (email, message, coinType) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const walletsResponse = await gridlock.getWallets();
  if (!walletsResponse.success) {
    console.error(`Error: ${walletsResponse.error.message} (Code: ${walletsResponse.error.code})`);
    process.exit(1);
  }
  const wallets = walletsResponse.data;
  const wallet = wallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora(`Signing message using ${coinType} wallet...`).start();

  const response = await gridlock.signMessage(message, coinType);

  if (response.success) {
    const resp = response.data;
    spinner.succeed('Message signed successfully');
    if (verbose) {
      console.log('Signed message response:', resp);
    } else {
      prettyLog({ message, walletAddress: wallet.address, signature: resp.signature });
    }
  } else {
    spinner.fail('Failed to sign message');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
  }
};

const verifyMessage = async (email, coinType, message, signature) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const walletsResponse = await gridlock.getWallets();
  if (!walletsResponse.success) {
    console.error(`Error: ${walletsResponse.error.message} (Code: ${walletsResponse.error.code})`);
    process.exit(1);
  }
  const wallets = walletsResponse.data;
  const wallet = wallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora('Verifying message...').start();

  const response = await gridlock.verifySignature(coinType, message, signature, wallet.address);

  if (response.success) {
    const isValid = response.data;
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
  } else {
    spinner.fail('Failed to verify message');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
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
  const response = await gridlock.getNodes();
  if (!response.success) {
    spinner.fail('Failed to retrieve network nodes');
  } else {
    const nodes = response.payload;
    spinner.succeed('Network nodes successfully retrieved');
    if (verbose) {
      console.log('Network nodes:', nodes);
    } else {
      console.dir(nodes, { depth: null });
    }
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
  const response = await gridlock.getUser();
  if (!response.success) {
    spinner.fail('Failed to retrieve user data');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
  } else {
    const user = response.payload.user;
    spinner.succeed('User data successfully retrieved');
    if (verbose) {
      console.log('User data:', user);
    } else {
      prettyLog({ email: user.email });
    }
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

  const response = await gridlock.getWallets();
  if (!response.success) {
    spinner.fail('No user wallets found.');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  const userWallets = response.data;
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
  const response = await gridlock.deleteUser();
  if (!response.success) {
    spinner.fail('Failed to delete user');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
  } else {
    spinner.succeed('User deleted successfully');
    logout();
  }
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
  const response = await gridlock.addUserGuardian({ name });

  if (!response.success) {
    spinner.fail('Failed to add guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
  } else {
    const data = response.data;
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

      const deeplinkResponse = await gridlock.generateGuardianDeeplink(params);
      if (!deeplinkResponse.success) {
        spinner.fail('Failed to generate guardian deeplink');
        console.error(`Error: ${deeplinkResponse.error.message} (Code: ${deeplinkResponse.error.code})`);
      } else {
        const deepLink = deeplinkResponse.data.deepLink;
        spinner.succeed('Successfully generated guardian activation link');

        qrcode.generate(deepLink, { small: true });
        console.log('Deep link: ', deepLink);
      }
    }
  }
};

const signTransaction = async (email, transaction, coinType) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const walletsResponse = await gridlock.getWallets();
  if (!walletsResponse.success) {
    console.error(`Error: ${walletsResponse.error.message} (Code: ${walletsResponse.error.code})`);
    process.exit(1);
  }
  const wallets = walletsResponse.data;
  const wallet = wallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora(`Signing transaction using ${coinType} wallet...`).start();

  const response = await gridlock.signTx(transaction, coinType);

  if (response.success) {
    const resp = response.data;
    spinner.succeed('Transaction signed successfully');
    if (verbose) {
      console.log('Signed transaction response:', resp);
    } else {
      prettyLog({ walletAddress: wallet.address, signature: resp.signedTx.signature });
    }
  } else {
    spinner.fail('Failed to sign transaction');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
  }
};

const createTransaction = async (email, coinType, transactionDetails) => {
  await initializeSdk();
  const initResult = await initUser(email);
  if (initResult !== true) {
    console.error(initResult);
    process.exit(1);
  }

  const spinner = ora(`Creating transaction for ${coinType}...`).start();

  try {
    const response = await gridlock.createSerializedTx(coinType, transactionDetails);
    if (response.success) {
      const transaction = response.data;
      spinner.succeed('Transaction created successfully');
      if (verbose) {
        console.log('Transaction details:', transaction);
      } else {
        prettyLog({ coinType, transaction: transaction.serializedTx });
      }
    } else {
      spinner.fail('Failed to create transaction');
      console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    }
  } catch (error) {
    spinner.fail('Failed to create transaction');
    console.error(error.message);
  }
};

// function printHeader() {
//   console.log(`
//   ==============================
//       My Awesome CLI Tool
//   ==============================
//   `);
// }

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  //printHeader();
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

program
  .command('create-tx')
  .description('Create a serialized transaction')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type (${SUPPORTED_COINS_STRING})`)
  .requiredOption('-d, --details <details>', 'Transaction details in JSON format')
  .action((options) => {
    const email = options.email;
    const coinType = verifyOptionCoinType(options);
    const transactionDetails = JSON.parse(options.details);

    createTransaction(email, coinType, transactionDetails);
  });


// Print header before processing commands
//printHeader();

program.parse(process.argv);
