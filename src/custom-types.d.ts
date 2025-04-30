import GridlockSdk from 'gridlock-sdk';

declare module 'gridlock-sdk' {
  interface GridlockSdk {
    transferOwner(params: { email: string; password: string }): Promise<any>;
  }
}
