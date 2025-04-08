/**
 * Type declarations for mysql2/promise module
 */

declare module 'mysql2/promise' {
  export interface ConnectionOptions {
    host: string;
    user: string;
    password: string;
    database?: string;
    port?: number;
    ssl?: any;
    [key: string]: any;
  }

  export interface Connection {
    query: (sql: string, values?: any[]) => Promise<[any[], any]>;
    execute: (sql: string, values?: any[]) => Promise<[any[], any]>;
    end: () => Promise<void>;
  }

  export function createConnection(options: ConnectionOptions): Promise<Connection>;
  export function createPool(options: ConnectionOptions): any;
} 