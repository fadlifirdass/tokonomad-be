import { Pool, PoolClient, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (!pool) {
    // SSL configuration for YugabyteDB Cloud
    let sslConfig: any = false;

    if (process.env.DB_SSL === 'true') {
      try {
        const certPath = path.join(__dirname, '../../root.crt');
        if (fs.existsSync(certPath)) {
          sslConfig = {
            ca: fs.readFileSync(certPath).toString(),
            rejectUnauthorized: false, // Changed to false for cloud connectivity
          };
        } else {
          console.warn('⚠️  SSL certificate not found, using rejectUnauthorized: false');
          sslConfig = {
            rejectUnauthorized: false,
          };
        }
      } catch (error) {
        console.error('Error loading SSL certificate:', error);
        sslConfig = {
          rejectUnauthorized: false,
        };
      }
    }

    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tokonomad',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 10, // Reduced pool size for cloud
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000, // Increased to 30 seconds
      ssl: sslConfig,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });

    pool.on('connect', () => {
      console.log('✅ PostgreSQL client connected');
    });
  }

  return pool;
};

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const pool = getDatabasePool();
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms - Rows: ${res.rowCount}`);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const pool = getDatabasePool();
  const client = await pool.connect();
  return client;
};

export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
};

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(100) PRIMARY KEY,
      external_id VARCHAR(100) UNIQUE NOT NULL,
      user_id VARCHAR(100) NOT NULL,
      zone_id VARCHAR(100),
      game_id VARCHAR(50) NOT NULL,
      game_name VARCHAR(100) NOT NULL,
      product_id VARCHAR(100) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_description TEXT,
      amount DECIMAL(10, 2) NOT NULL,
      service_fee DECIMAL(10, 2) DEFAULT 0,
      payment_fee DECIMAL(10, 2) DEFAULT 0,
      total DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50),
      payment_channel VARCHAR(50),
      status VARCHAR(50) DEFAULT 'PENDING',
      xendit_invoice_id VARCHAR(100),
      xendit_invoice_url TEXT,
      xendit_expiry_date TIMESTAMP,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
  `;

  try {
    await query(createTransactionsTable);
    await query(createIndexes);
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
