import gridlock from './initGridlock.js';
import { IGuardian } from 'gridlock-sdk/types';
import chalk from 'chalk';
import readline from 'readline';

// **************************************************************************************
// CONFIGURATION: Update these values with your own settings
// **************************************************************************************
// User details
const USER_EMAIL = 'gilfoyle@piedpiper.com';
const USER_PASSWORD = 'password123';
const USER_NAME = 'Bertram Gilfoyle';

// Recovery settings
const RECOVERY_PASSWORD = 'my_new_password123';

// Blockchain settings
const BLOCKCHAIN = 'solana'; // Options: 'solana', 'ethereum', etc.

// Cloud Guardian details
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
console.log(`- Name: ${USER_NAME}`);
console.log(`- Email: ${USER_EMAIL}`);
console.log(`- Password: ${USER_PASSWORD}`);

try {
  const { user, authTokens } = await gridlock.createUser({
    name: USER_NAME,
    email: USER_EMAIL,
    password: USER_PASSWORD,
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
    email: USER_EMAIL,
    password: USER_PASSWORD,
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
    email: USER_EMAIL,
    password: USER_PASSWORD,
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
    email: USER_EMAIL,
    password: USER_PASSWORD,
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
console.log(`- Blockchain: ${BLOCKCHAIN}`);

// Declare wallet address variable outside the try block so it can be used in later steps
let walletAddress: string | undefined;

try {
  const wallet = await gridlock.createWallet({
    email: USER_EMAIL,
    password: USER_PASSWORD,
    blockchain: BLOCKCHAIN,
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
    email: USER_EMAIL,
    password: USER_PASSWORD,
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
    email: USER_EMAIL,
    password: USER_PASSWORD,
    message,
    address: walletAddress,
    signature: signature.signature,
  });

  console.log('\n✅ Signature verification result:', isVerified ? 'VALID ✓' : 'INVALID ✗');
} catch (error) {
  console.error('❌ Error during signing or verification:', error);
}

// **************************************************************************************
// STEP 8: ACCOUNT RECOVERY
// **************************************************************************************
console.log(chalk.hex('#FF8C00')('\n' + '*'.repeat(80)));
console.log(chalk.hex('#FF8C00')('STEP 8: ACCOUNT RECOVERY'));
console.log(chalk.hex('#FF8C00')('*'.repeat(80)));
console.log('Demonstrating account recovery process:');
console.log(`- Email: ${USER_EMAIL}`);
console.log(`- New Password: ${RECOVERY_PASSWORD}`);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to get user input
const getUserInput = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

// Define the recovery function
const initiateRecovery = async () => {
  try {
    console.log('\nInitiating account recovery...');

    await gridlock.startRecovery({
      email: USER_EMAIL,
      password: RECOVERY_PASSWORD,
    });

    console.log('\n✅ Recovery initiated successfully!');
    console.log(`- A verification code has been sent to ${USER_EMAIL}`);

    // Wait for user to input the verification code
    const recoveryCode = await getUserInput(
      '\nPlease check your email and enter the verification code: '
    );

    // Confirm recovery with the code
    console.log('\nConfirming recovery with provided code...');

    await gridlock.confirmRecovery({
      email: USER_EMAIL,
      password: RECOVERY_PASSWORD,
      recoveryCode: recoveryCode,
    });

    console.log('\n✅ Recovery confirmed successfully!');
    console.log('- Account has been recovered with the new password');
    console.log('- You can now access your wallet and guardians with the new credentials');

    // **************************************************************************************
    // STEP 9: VERIFY RECOVERY SUCCESS
    // **************************************************************************************
    // Only proceed to Step 9 if Step 8 was successful
    console.log(chalk.hex('#9932CC')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#9932CC')('STEP 9: VERIFY RECOVERY SUCCESS'));
    console.log(chalk.hex('#9932CC')('*'.repeat(80)));
    console.log(
      'Confirming successful recovery by signing and verifying a message with new credentials:'
    );

    const recoveryTestMessage = 'This message confirms successful account recovery';
    console.log(`- Test Message: "${recoveryTestMessage}"`);
    console.log(`- Using Email: ${USER_EMAIL}`);
    console.log(`- Using New Password: ${RECOVERY_PASSWORD}`); //this is an example program, so we're showing the password here

    // Check if wallet address is available
    if (!walletAddress) {
      throw new Error('Wallet address not available. Cannot verify recovery success.');
    }

    console.log('\nSigning message with recovered account...');
    await new Promise((resolve) => setTimeout(resolve, 3000)); //delay to ensure fs operations are complete on signing node

    // Sign message with new credentials
    const recoverySignature = await gridlock.signTransaction({
      email: USER_EMAIL,
      password: RECOVERY_PASSWORD,
      address: walletAddress,
      message: recoveryTestMessage,
    });

    console.log('\n✅ Message signed successfully with new credentials!');
    console.log('- Signature:', recoverySignature.signature);
    console.log('- Wallet Address Used:', walletAddress);

    // Verify signature with new credentials
    console.log('\nVerifying signature with recovered account...');

    const isRecoveryVerified = await gridlock.verifySignature({
      email: USER_EMAIL,
      password: RECOVERY_PASSWORD,
      message: recoveryTestMessage,
      address: walletAddress,
      signature: recoverySignature.signature,
    });

    console.log('\n✅ Recovery verification result:', isRecoveryVerified ? 'VALID ✓' : 'INVALID ✗');

    if (isRecoveryVerified) {
      console.log('\n🎉 ACCOUNT RECOVERY SUCCESSFUL! 🎉');
      console.log('- Your account has been fully recovered with the new password');
      console.log('- You have full access to your wallet and can sign transactions');
    } else {
      console.log('\n⚠️ Recovery verification failed. Please check your credentials.');
    }

    console.log('\nStep 9 (Verify Recovery Success) completed.');
    console.log('\n' + '='.repeat(80));
    console.log('RECOVERY EXAMPLE COMPLETED');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Error during recovery process:', error);
    console.log('\nRecovery example could not be completed due to an error.');
  } finally {
    // Close readline interface after all steps are complete
    rl.close();
  }
};

// Run recovery process automatically
console.log('\nStarting recovery process automatically...');
// Proceed directly with recovery without confirmation
initiateRecovery();
