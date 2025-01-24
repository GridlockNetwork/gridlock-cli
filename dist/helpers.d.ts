export declare const green: (...args: any[]) => string;
export declare const red: (...args: any[]) => string;
interface PrettyLogOptions {
    space?: boolean;
    onlyValues?: boolean;
}
export declare const prettyLog: (data: any, options?: PrettyLogOptions) => void;
export {};
