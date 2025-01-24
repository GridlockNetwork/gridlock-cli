import type { ILoginResponse } from 'gridlock-sdk/dist/types/auth.type.d.ts';
interface UserCredentials {
    email: string;
    password: string;
}
export declare function login({ email, password }: UserCredentials): Promise<ILoginResponse | null>;
export {};
