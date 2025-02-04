import { program } from 'commander';
import GridlockSdk from 'gridlock-sdk';

import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import { createUserInquire, recoverInquire } from './user.service.js';
import { addGuardianInquire } from './guardian.service.js';
import { showNetworkInquire } from './network.service.js';
import {
  createWalletInquire,
  signTransactionInquire,
  verifySignatureInquire,
} from './wallet.service.js';

export const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

let verbose = false;

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  gridlock.setVerbose(verbose);
});
program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

program
  .command('show-network')
  .description('Displays the guardians associated with a specific user')
  .option('-e, --email <email>', 'User email')
  .action(async (options) => {
    await showNetworkInquire({ email: options.email });
  });

program
  .command('create-user')
  .description('Create a new user')
  .option('-n, --name <name>', 'User name')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .action(async (options) => {
    await createUserInquire({
      name: options.name,
      email: options.email,
      password: options.password,
    });
  });

program
  .command('add-guardian')
  .description("Add a guardian to a specific user's node pool")
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .option('-t, --type <type>', 'Type of guardian (cloud or gridlock)')
  .option('-o, --owner', 'Is this the owner guardian')
  .option('-n, --name <name>', 'Guardian name')
  .option('-i, --nodeId <nodeId>', 'Guardian node ID')
  .option('-k, --publicKey <publicKey>', 'Guardian public key')
  .action(async (options) => {
    await addGuardianInquire({
      email: options.email,
      password: options.password,
      guardianType: options.type,
      isOwnerGuardian: options.owner,
      name: options.name,
      nodeId: options.nodeId,
      publicKey: options.publicKey,
    });
  });

program
  .command('create-wallet')
  .description('Create a new wallet')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to create wallet for')
  .action(async (options) => {
    await createWalletInquire({
      email: options.email,
      password: options.password,
      blockchain: options.blockchain,
    });
  });

program
  .command('sign')
  .description('Sign a transaction')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-a, --address <address>', 'Blockchain to use')
  .option('-m, --message <message>', 'Message to be signed')
  .action(async (options) => {
    await signTransactionInquire({
      email: options.email,
      password: options.password,
      address: options.address,
      message: options.message,
    });
  });

program
  .command('verify')
  .description('Verify a signature')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-m, --message <message>', 'Message to be verified')
  .option('-a, --address <address>', 'Address')
  .option('-b, --blockchain <blockchain>', 'Blockchain')
  .option('-s, --signature <signature>', 'Signature to be verified')
  .action(async (options) => {
    await verifySignatureInquire({
      email: options.email,
      password: options.password,
      message: options.message,
      address: options.address,
      blockchain: options.blockchain,
      signature: options.signature,
    });
  });

program
  .command('recover')
  .description('Recover account using email')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .action(async (options) => {
    await recoverInquire({ email: options.email, password: options.password });
  });

// ---------------- RUN PROGRAM ----------------

program.parseAsync(process.argv);
