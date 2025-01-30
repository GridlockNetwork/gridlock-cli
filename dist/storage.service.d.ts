import type { IUser } from 'gridlock-sdk/dist/types/user.type.d.ts';
import type { IGuardian } from 'gridlock-sdk/dist/types/guardian.type.d.ts';
import type { AccessAndRefreshTokens } from 'gridlock-sdk/dist/types/auth.type.d.ts';
/**
 * Loads the token for the specified email and token type.
 *
 * @param {Object} params - The parameters for loading the token.
 * @param {string} params.email - The email associated with the token.
 * @param {string} params.type - The type of token to load.
 * @returns {string | null} The token string for the requested type of token, or null if not found.
 */
export declare function loadToken({ email, type }: {
    email: string;
    type: string;
}): any;
export declare function saveTokens({ authTokens, email, }: {
    authTokens: AccessAndRefreshTokens;
    email: string;
}): void;
export declare function saveKey({ identifier, key, type }: {
    identifier: string;
    key: any;
    type: string;
}): void;
/**
 * Loads a key of a specified type defined by the identifier.
 *
 * @param {Object} params - The parameters for loading the key.
 * @param {string} params.identifier - The identifier for the entity associated with the key.
 * @param {string} params.type - The type of the key (e.g., private, public, signing).
 *
 * @returns {Object|null} The key data if the key file exists and passes the integrity check, otherwise null.
 *
 * @throws {Error} If the key file integrity check fails.
 *
 * @remarks
 * - `private` and `public` types are used for node identity to facilitate encrypted E2E communication.
 * - `signing` type is used to sign transactions.
 */
export declare function loadKey({ identifier, type }: {
    identifier: string;
    type: string;
}): any;
export declare function saveGuardian({ guardian }: {
    guardian: IGuardian;
}): void;
export declare function loadGuardians(): IGuardian[];
export declare function loadGuardian({ nodeId }: {
    nodeId: string;
}): IGuardian | null;
export declare function saveUser({ user }: {
    user: IUser;
}): void;
export declare function loadUser({ email }: {
    email: string;
}): IUser | null;
export declare function saveWallet({ wallet }: {
    wallet: any;
}): void;
export declare function loadWallet({ address }: {
    address: string;
}): any;
