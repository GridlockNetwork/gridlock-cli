import gridlock from './initGridlock.js';
import { IGuardian } from 'gridlock-sdk/types';
import chalk from 'chalk';

// **************************************************************************************
// CONFIGURATION: Update these values with your own guardian details
// **************************************************************************************
const CLOUD_GUARDIAN: IGuardian = {
  name: 'EXAMPLE CLOUD GUARDIAN',
  nodeId: '8e198cc0-eace-4b9b-a12c-7a6e6801078e',
  publicKey: 'UA2IGJVRR2LXXLUJTBDWRXH55IV2N5JNJQLABEH52COWVWXKYCFVEZJD',
  e2ePublicKey: 'DJeBSqPAN6J3tSy34Ora/Bdl4/B/K13pkOkZv4DNUCc=',
  type: 'cloud',
  active: true,
};

console.log(chalk.blue('='.repeat(80)));
console.log(chalk.blue('GRIDLOCK SDK EXAMPLE USAGE'));
console.log(chalk.blue('='.repeat(80)));
console.log('Initializing Gridlock SDK with configuration:');

// **************************************************************************************
// STEP 1: CREATING A NEW USER
// **************************************************************************************
console.log(chalk.green('\n' + '*'.repeat(80)));
console.log(chalk.green('STEP 1: CREATING A NEW USER'));
console.log(chalk.green('*'.repeat(80)));
console.log('Creating user with the following details:');
console.log('- Name: Bertram Gilfoyle');
console.log('- Email: gilfoyle@piedpiper.com');
console.log('- Password: password123');

try {
  const { user, authTokens } = await gridlock.createUser({
    name: 'Bertram Gilfoyle',
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    saveCredentials: false,
  });

  console.log('\n✅ User created successfully!');
  console.log('- Name:', user.name);
  console.log('- Email:', user.email);
  console.log('- Auth Tokens Received:', authTokens ? 'Yes' : 'No');
} catch (error) {
  console.error('❌ Error creating user:', error);
  process.exit(1);
}

// **************************************************************************************
// STEP 2: ADDING A CLOUD GUARDIAN
// **************************************************************************************
console.log(chalk.cyan('\n' + '*'.repeat(80)));
console.log(chalk.cyan('STEP 2: ADDING A CLOUD GUARDIAN'));
console.log(chalk.cyan('*'.repeat(80)));
console.log('Preparing Cloud Guardian data:');

// Use the guardian data defined at the top of the file
const guardianData = CLOUD_GUARDIAN;

console.log('- Guardian Name:', guardianData.name);
console.log('- Node ID:', guardianData.nodeId);
console.log('- Type:', guardianData.type);
console.log('- Is Owner Guardian: Yes');

try {
  const response = await gridlock.addGuardian({
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    guardian: guardianData,
    isOwnerGuardian: true,
  });

  console.log('\n✅ Cloud Guardian added successfully!');
  console.log('- Guardian Name:', response.guardian.name);
  console.log('- Guardian Type:', response.guardian.type);
} catch (error) {
  console.error('❌ Error adding Cloud Guardian:', error);
}

// **************************************************************************************
// STEP 3: ADDING A GRIDLOCK GUARDIAN
// **************************************************************************************
console.log(chalk.magenta('\n' + '*'.repeat(80)));
console.log(chalk.magenta('STEP 3: ADDING A GRIDLOCK GUARDIAN'));
console.log(chalk.magenta('*'.repeat(80)));
console.log('Adding a professional Gridlock Guardian:');
console.log('- Type: gridlock');

try {
  const response = await gridlock.addProfessionalGuardian({
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    type: 'gridlock',
  });

  console.log('\n✅ Gridlock Guardian added successfully!');
  console.log('- Guardian Name:', response.guardian.name);
  console.log('- Guardian Type:', response.guardian.type);
} catch (error) {
  console.error('❌ Error adding Gridlock Guardian:', error);
}

// **************************************************************************************
// STEP 4: ADDING A PARTNER GUARDIAN
// **************************************************************************************
console.log(chalk.yellow('\n' + '*'.repeat(80)));
console.log(chalk.yellow('STEP 4: ADDING A PARTNER GUARDIAN'));
console.log(chalk.yellow('*'.repeat(80)));
console.log('Adding a professional Partner Guardian:');
console.log('- Type: partner');

try {
  const partnerGuardian = await gridlock.addProfessionalGuardian({
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    type: 'partner',
  });

  console.log('\n✅ Partner Guardian added successfully!');
  console.log('- Guardian Name:', partnerGuardian.guardian.name);
  console.log('- Guardian Type:', partnerGuardian.guardian.type);
} catch (error) {
  console.error('❌ Error adding Partner Guardian:', error);
}

// **************************************************************************************
// STEP 5: CREATING A WALLET
// **************************************************************************************
console.log(chalk.red('\n' + '*'.repeat(80)));
console.log(chalk.red('STEP 5: CREATING A WALLET'));
console.log(chalk.red('*'.repeat(80)));
console.log('Creating a new wallet:');
console.log('- Blockchain: solana');

// Declare wallet address variable outside the try block so it can be used in later steps
let walletAddress: string | undefined;

try {
  const wallet = await gridlock.createWallet({
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    blockchain: 'solana',
  });

  walletAddress = wallet?.address;
  console.log('\n✅ Wallet created successfully!');
  console.log('- Wallet Address:', walletAddress);
  console.log('- Blockchain:', wallet?.blockchain);
} catch (error) {
  console.error('❌ Error creating wallet:', error);
  process.exit(1);
}

// **************************************************************************************
// STEP 6: SIGNING A MESSAGE
// **************************************************************************************
console.log(chalk.blue('\n' + '*'.repeat(80)));
console.log(chalk.blue('STEP 6: SIGNING A MESSAGE'));
console.log(chalk.blue('*'.repeat(80)));

const message = 'This is a message to be signed';
console.log('Signing the following message:');
console.log(`"${message}"`);

try {
  // Use the wallet address from step 5 instead of creating a new wallet
  if (!walletAddress) {
    throw new Error('Wallet address not available. Wallet creation may have failed.');
  }

  const signature = await gridlock.signTransaction({
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    address: walletAddress,
    message,
  });

  console.log('\n✅ Message signed successfully!');
  console.log('- Signature:', signature.signature.substring(0, 20) + '...');
  console.log('- Wallet Address Used:', walletAddress);

  // **************************************************************************************
  // STEP 7: VERIFYING THE SIGNATURE
  // **************************************************************************************
  console.log(chalk.green('\n' + '*'.repeat(80)));
  console.log(chalk.green('STEP 7: VERIFYING THE SIGNATURE'));
  console.log(chalk.green('*'.repeat(80)));
  console.log('Verifying signature for message:');
  console.log(`"${message}"`);

  const isVerified = await gridlock.verifySignature({
    email: 'gilfoyle@piedpiper.com',
    password: 'password123',
    message,
    address: walletAddress,
    signature: signature.signature,
  });

  console.log('\n✅ Signature verification result:', isVerified ? 'VALID ✓' : 'INVALID ✗');
} catch (error) {
  console.error('❌ Error during signing or verification:', error);
}

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE COMPLETED');
console.log('='.repeat(80));
