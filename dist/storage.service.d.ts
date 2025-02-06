import type { IUser } from 'gridlock-sdk/dist/types/user.type.d.ts';
import type { IGuardian } from 'gridlock-sdk/dist/types/guardian.type.d.ts';
export declare function loadUser({ email }: {
    email: string;
}): IUser | null;
export declare function loadGuardians(): IGuardian[];
