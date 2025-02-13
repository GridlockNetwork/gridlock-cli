import type { IUser } from 'gridlock-sdk/dist/user/user.interfaces.js';
import type { IGuardian } from 'gridlock-sdk/dist/guardian/guardian.interfaces.js';
export declare function loadUser({ email }: {
    email: string;
}): IUser | null;
export declare function loadGuardians(): IGuardian[];
