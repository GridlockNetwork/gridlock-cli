import fs from 'fs';
import path from 'path';
import os from 'os';
import type { IUser } from 'gridlock-sdk/dist/types/user.type.d.ts';

const USERS_DIR = path.join(os.homedir(), '.gridlock-cli', 'users');

export function loadUser({ email }: { email: string }): IUser | null {
  const filePath = path.join(USERS_DIR, `${email}.user.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
