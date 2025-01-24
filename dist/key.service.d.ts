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
export declare function generateSigningKey(): Promise<Buffer>;
export declare function generateIdentityKey(): {
    privateKey: string;
    publicKey: string;
};
/**
 * Derives a stronger, unique node-specific key using HKDF.
 * @param {Buffer} signingKey - The encrypted signing key.
 * @param {string} nodeId - The unique node ID.
 * @returns {string} - A unique per-node derived key.
 */
export declare function nodeSigningKey(signingKey: Buffer, nodeId: string): string;
