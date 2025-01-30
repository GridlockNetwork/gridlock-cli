import type { IGuardian } from 'gridlock-sdk/dist/types/guardian.type.d.ts';
export declare function getGridlockGuardians(): Promise<IGuardian[] | null>;
export declare function addGridlockGuardian(): Promise<void>;
export declare function addCloudGuardian({ email, password, guardian, isOwnerGuardian, }: {
    email: string;
    password: string;
    guardian: IGuardian;
    isOwnerGuardian: boolean;
}): Promise<void>;
