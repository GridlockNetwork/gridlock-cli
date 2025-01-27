import type { PasswordBundle } from 'gridlock-sdk/dist/types/wallet.type.d.ts';
import type { IUser } from 'gridlock-sdk/dist/types/user.type.d.ts';
export declare function encryptKey({ key, password }: {
    key: string;
    password: string;
}): Promise<{
    key: string;
    iv: string;
    authTag: string;
    salt: string;
    algorithm: string;
    createdAt: string;
}>;
export declare function decryptKey({ encryptedKeyObject, password, }: {
    encryptedKeyObject: any;
    password: string;
}): Promise<string>;
export declare function generateSigningKey(): Promise<string>;
export declare function generateE2EKey(): {
    publicKey: string;
    privateKey: string;
};
/**
 * Derives a stronger, unique node-specific key using HKDF.
 * @param {Buffer} signingKey - The encrypted signing key.
 * @param {string} nodeId - The unique node ID.
 * @returns {string} - A unique per-node derived key.
 */
export declare function getNodeSigningKey(signingKey: Buffer, nodeId: string): string;
export declare function encryptContents({ content, publicKey, identifier, password, }: {
    content: string;
    publicKey: string;
    identifier: string;
    password: string;
}): Promise<string>;
export declare function generatePasswordBundle({ user, password, }: {
    user: IUser;
    password: string;
}): Promise<PasswordBundle>;
