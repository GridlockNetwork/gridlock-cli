import gridlock from './initGridlock.js';
import { IGuardian } from 'gridlock-sdk/types';

// **************************************************************************************
//First, create a user
// **************************************************************************************

const { user, authTokens } = await gridlock.createUser({
  name: 'Bertram Gilfoyle',
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  saveCredentials: false,
});

console.log('User created:', user.name);
console.log('Email:', user.email);

// **************************************************************************************
//Begin building the user's guardian list by adding a Cloud Guardian to the user
// **************************************************************************************
const guardianData: IGuardian = {
  name: 'EXAMPLE CLOUD GUARDIAN',
  nodeId: 'f90f889a-01ea-415f-81fe-ed624c6b0541',
  publicKey: 'UDFCR7NI5DJEAUSEIWWBIXBNQQLWBBPSSDSF5AOCMNW5LMZQGOVT7RCC',
  e2ePublicKey: 'Zos8ukwJEL7TFvrtinuV9AQNC2if3rwcb55HJLnpIlQ',
  type: 'cloud',
  active: true,
};

const guardian = await gridlock.addGuardian({
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  guardian: guardianData,
  isOwnerGuardian: false,
});

console.log('Guardian added:', guardian);

// **************************************************************************************
// Then add a second guardian to the user, this time a Gridlock Guardian
// **************************************************************************************
const response = await gridlock.addProfessionalGuardian({
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  type: 'gridlock',
});

console.log('Gridlock Guardian added:', response.guardian.name);

// **************************************************************************************
// Finally, add a third guardian to the user, this time a Partner Guardian
// **************************************************************************************
const partnerGuardian = await gridlock.addProfessionalGuardian({
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  type: 'partner',
});

console.log('Partner Guardian added:', partnerGuardian.guardian.name);

// **************************************************************************************
// Generate a wallet using all of your guardians
// **************************************************************************************

const wallet = await gridlock.createWallet({
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  blockchain: 'solana',
});

const walletAddress = wallet?.address;
console.log('Wallet created:', walletAddress);

// **************************************************************************************
// Sign a message using the user's wallet
// **************************************************************************************

const message = 'This is a message to be signed';
const signature = await gridlock.signTransaction({
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  address: walletAddress as string,
  message,
});

console.log('Message signed:', signature);

// **************************************************************************************
// Verify the signature of the message
// **************************************************************************************

const isVerified = await gridlock.verifySignature({
  email: 'gilfdoyle@piedpiper.com',
  password: 'password123',
  message,
  address: walletAddress as string,
  signature: signature.signature,
});

console.log('Signature verified:', isVerified);
