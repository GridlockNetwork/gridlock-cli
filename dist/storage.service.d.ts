import type { IUser } from 'gridlock-sdk/dist/types/user.type.d.ts';
import type { IGuardian } from 'gridlock-sdk/dist/types/guardian.type.d.ts';
import type { ILoginResponse } from 'gridlock-sdk/dist/types/auth.type.d.ts';
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
export declare function saveTokens({ authTokens, email }: {
    authTokens: ILoginResponse;
    email: string;
}): void;
export declare function saveKey({ identifier, key, type }: {
    identifier: string;
    key: any;
    type: string;
}): void;
export declare function loadKey({ nodeId, type }: {
    nodeId: string;
    type: string;
}): any;
export declare function saveGuardian({ guardian }: {
    guardian: IGuardian;
}): void;
export declare function loadGuardians(): IGuardian[];
export declare function saveUser({ user }: {
    user: IUser;
}): void;
export declare function loadUser({ email }: {
    email: string;
}): IUser | null;
