import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import os from 'os';

const GUARDIANS_DIR = path.join(os.homedir(), '.gridlock-cli', 'guardians');
const USERS_DIR = path.join(os.homedir(), '.gridlock-cli', 'users');
const TOKENS_DIR = path.join(os.homedir(), '.gridlock-cli', 'tokens');
const KEYS_DIR = path.join(os.homedir(), '.gridlock-cli', 'keys');

export function loadToken(email, type = 'access') {
  const filePath = path.join(TOKENS_DIR, `${email}.tokens.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const tokens = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return tokens[type].token;
}

export function saveTokens(tokens, email) {
  if (!fs.existsSync(TOKENS_DIR)) {
    fs.mkdirSync(TOKENS_DIR, { recursive: true });
  }
  const filePath = path.join(TOKENS_DIR, `${email}.tokens.json`);
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2) + '\n');
}

export function saveKey(nodeId, keyObject, type) {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }
  const checksum = crypto.createHash('sha256').update(JSON.stringify(keyObject)).digest('hex');
  const filePath = path.join(KEYS_DIR, `${nodeId}.${type}.key.json`);
  fs.writeFileSync(filePath, JSON.stringify({ ...keyObject, checksum }, null, 2));
}

export function loadKey(nodeId, type) {
  const filePath = path.join(KEYS_DIR, `${nodeId}.${type}.key.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const keyObject = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const { checksum, ...keyData } = keyObject;
  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex');
  if (checksum !== calculatedChecksum) {
    throw new Error('Key file integrity check failed. The file may be corrupted or tampered with.');
  }
  return keyData;
}

export function saveGuardian(guardian) {
  if (!fs.existsSync(GUARDIANS_DIR)) {
    fs.mkdirSync(GUARDIANS_DIR, { recursive: true });
  }
  const filePath = path.join(GUARDIANS_DIR, `${guardian.nodeId}.guardian.json`);
  fs.writeFileSync(filePath, JSON.stringify(guardian, null, 2));
}

export function loadGuardians() {
  if (!fs.existsSync(GUARDIANS_DIR)) {
    return [];
  }
  return fs.readdirSync(GUARDIANS_DIR).map((file) => {
    const filePath = path.join(GUARDIANS_DIR, file);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });
}

export function saveUser(user) {
  if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
  }
  const filePath = path.join(USERS_DIR, `${user.email}.user.json`);
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2) + '\n');
}

export function loadUser(email) {
  const filePath = path.join(USERS_DIR, `${email}.user.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
