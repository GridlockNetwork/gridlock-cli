import type { AccessAndRefreshTokens } from 'gridlock-sdk/dist/types/auth.type.d.ts';
interface UserCredentials {
    email: string;
    password: string;
}
export declare function login({ email, password }: UserCredentials): Promise<AccessAndRefreshTokens | null>;
interface E2EEncryptionParams {
    recieverPrivKeyIdentifier: string;
    password: string;
    message: string;
    senderPubKey: string;
}
export declare function decryptmessage({ recieverPrivKeyIdentifier, password, message, senderPubKey, }: E2EEncryptionParams): Promise<string | null>;
export {};
