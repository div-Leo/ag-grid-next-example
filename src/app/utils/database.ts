/**
 * Database utility module for MySQL connections
 */

// Import types from our declaration file
import type { Connection } from 'mysql2/promise';

// Configuration (in practice, should come from environment variables)
export const dbConfig = {
  host: 'localhost',
  user: 'reporting_app',
  password: 'password123',
  database: 'sample_data'
};

/**
 * Creates a database connection
 * @returns Promise with connection object
 */
export async function createDbConnection(): Promise<Connection> {
  // Dynamic import to avoid issues with server components
  try {
    const mysql = await import('mysql2/promise');
    return mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Error importing mysql2 or creating connection:', error);
    throw error;
  }
}

/**
 * Executes a SQL query
 * @param sql SQL query to execute
 * @returns Promise with query results
 */
export async function executeQuery(sql: string): Promise<any[]> {
  let conn: Connection | undefined;

  try {
    conn = await createDbConnection();
    const [results] = await conn.query(sql);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
} 