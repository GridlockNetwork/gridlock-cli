import fs from 'fs';
import path from 'path';
import os from 'os';
const USERS_DIR = path.join(os.homedir(), '.gridlock-cli', 'users');
const GUARDIANS_DIR = path.join(os.homedir(), '.gridlock-cli', 'guardians');
export function loadUser({ email }) {
    const filePath = path.join(USERS_DIR, `${email}.user.json`);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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
//# sourceMappingURL=storage.service.js.map