import type { AccessAndRefreshTokens } from 'gridlock-sdk/dist/types/auth.type.d.ts';
interface UserCredentials {
    email: string;
    password: string;
}
export declare function login({ email, password }: UserCredentials): Promise<AccessAndRefreshTokens | null>;
interface E2EEncryptionParams {
    email: string;
    password: string;
    content: string;
    target: string;
}
export declare function encryptContents({ email, password, content, target, }: E2EEncryptionParams): Promise<string | null>;
export {};
