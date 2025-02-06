// import fs from 'fs';
// import crypto from 'crypto';
// import path from 'path';
// import os from 'os';
// import type { IUser } from 'gridlock-sdk/dist/types/user.type.d.ts';
// import type { IGuardian } from 'gridlock-sdk/dist/types/guardian.type.d.ts';
// import type { AccessAndRefreshTokens } from 'gridlock-sdk/dist/types/auth.type.d.ts';

// const GUARDIANS_DIR = path.join(os.homedir(), '.gridlock-cli', 'guardians');
// const USERS_DIR = path.join(os.homedir(), '.gridlock-cli', 'users');
// const TOKENS_DIR = path.join(os.homedir(), '.gridlock-cli', 'tokens');
// const KEYS_DIR = path.join(os.homedir(), '.gridlock-cli', 'keys');
// const WALLETS_DIR = path.join(os.homedir(), '.gridlock-cli', 'wallets');

// /**
//  * Loads the token for the specified email and token type.
//  *
//  * @param {Object} params - The parameters for loading the token.
//  * @param {string} params.email - The email associated with the token.
//  * @param {string} params.type - The type of token to load.
//  * @returns {string | null} The token string for the requested type of token, or null if not found.
//  */
// export function loadToken({ email, type }: { email: string; type: string }) {
//   const filePath = path.join(TOKENS_DIR, `${email}.token.json`);
//   if (!fs.existsSync(filePath)) {
//     return null;
//   }
//   const authTokens = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   return authTokens[type]?.token || null;
// }

// export function saveTokens({
//   authTokens,
//   email,
// }: {
//   authTokens: AccessAndRefreshTokens;
//   email: string;
// }) {
//   if (!fs.existsSync(TOKENS_DIR)) {
//     fs.mkdirSync(TOKENS_DIR, { recursive: true });
//   }
//   const filePath = path.join(TOKENS_DIR, `${email}.token.json`);
//   fs.writeFileSync(filePath, JSON.stringify(authTokens, null, 2) + '\n');
// }

// export function saveKey({ identifier, key, type }: { identifier: string; key: any; type: string }) {
//   if (!fs.existsSync(KEYS_DIR)) {
//     fs.mkdirSync(KEYS_DIR, { recursive: true });
//   }
//   const checksum = crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');
//   const filePath = path.join(KEYS_DIR, `${identifier}.${type}.key.json`);
//   fs.writeFileSync(filePath, JSON.stringify({ ...key, checksum }, null, 2));
// }

// /**
//  * Loads a key of a specified type defined by the identifier.
//  *
//  * @param {Object} params - The parameters for loading the key.
//  * @param {string} params.identifier - The identifier for the entity associated with the key.
//  * @param {string} params.type - The type of the key (e.g., private, public, signing).
//  *
//  * @returns {Object|null} The key data if the key file exists and passes the integrity check, otherwise null.
//  *
//  * @throws {Error} If the key file integrity check fails.
//  *
//  * @remarks
//  * - `private` and `public` types are used for node identity to facilitate encrypted E2E communication.
//  * - `signing` type is used to sign transactions.
//  */
// export function loadKey({ identifier, type }: { identifier: string; type: string }) {
//   const filePath = path.join(KEYS_DIR, `${identifier}.${type}.key.json`);
//   if (!fs.existsSync(filePath)) {
//     return null;
//   }
//   const keyObject = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   const { checksum, ...keyData } = keyObject;
//   const calculatedChecksum = crypto
//     .createHash('sha256')
//     .update(JSON.stringify(keyData))
//     .digest('hex');
//   if (checksum !== calculatedChecksum) {
//     throw new Error('Key file integrity check failed. The file may be corrupted or tampered with.');
//   }
//   return keyData;
// }

// export function saveGuardian({ guardian }: { guardian: IGuardian }) {
//   if (!fs.existsSync(GUARDIANS_DIR)) {
//     fs.mkdirSync(GUARDIANS_DIR, { recursive: true });
//   }
//   const filePath = path.join(GUARDIANS_DIR, `${guardian.nodeId}.guardian.json`);
//   fs.writeFileSync(filePath, JSON.stringify(guardian, null, 2));
// }

// export function loadGuardians(): IGuardian[] {
//   if (!fs.existsSync(GUARDIANS_DIR)) {
//     return [];
//   }
//   return fs.readdirSync(GUARDIANS_DIR).map((file) => {
//     const filePath = path.join(GUARDIANS_DIR, file);
//     return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   });
// }

// export function loadGuardian({ nodeId }: { nodeId: string }): IGuardian | null {
//   const filePath = path.join(GUARDIANS_DIR, `${nodeId}.guardian.json`);
//   if (!fs.existsSync(filePath)) {
//     return null;
//   }
//   return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
// }

// export function saveUser({ user }: { user: IUser }) {
//   if (!fs.existsSync(USERS_DIR)) {
//     fs.mkdirSync(USERS_DIR, { recursive: true });
//   }
//   const filePath = path.join(USERS_DIR, `${user.email}.user.json`);
//   fs.writeFileSync(filePath, JSON.stringify(user, null, 2) + '\n');
// }

// export function loadUser({ email }: { email: string }): IUser | null {
//   const filePath = path.join(USERS_DIR, `${email}.user.json`);
//   if (!fs.existsSync(filePath)) {
//     return null;
//   }
//   return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
// }

// export function saveWallet({ wallet }: { wallet: any }) {
//   if (!fs.existsSync(WALLETS_DIR)) {
//     fs.mkdirSync(WALLETS_DIR, { recursive: true });
//   }
//   const filePath = path.join(WALLETS_DIR, `${wallet.address}.wallet.json`);
//   fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2) + '\n');
// }

// export function loadWallet({ address }: { address: string }) {
//   const filePath = path.join(WALLETS_DIR, `${address}.wallet.json`);
//   if (!fs.existsSync(filePath)) {
//     return null;
//   }
//   return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
// }
