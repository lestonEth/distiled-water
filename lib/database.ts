import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  database: process.env.DATABASE_NAME || 'distilled_water_db',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute query with error handling
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute transaction
export async function executeTransaction(
  queries: Array<{ query: string; params: any[] }>
): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const { query, params } of queries) {
      await connection.execute(query, params);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Close pool connections
export async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Health check for database
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
}> {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Get database info
      const [result] = await pool.execute('SELECT VERSION() as version, NOW() as currentTime');
      const dbInfo = result as any[];
      
      return {
        status: 'healthy',
        message: `Database connected successfully. Version: ${dbInfo[0]?.version || 'Unknown'}`,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}