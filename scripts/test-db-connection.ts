/**
 * Test Database Connection
 * Run with: npx ts-node scripts/test-db-connection.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function testConnection() {
  console.log('\n🔍 Testing YugabyteDB Connection...\n');
  
  // Display configuration
  console.log('📋 Configuration:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   SSL: ${process.env.DB_SSL}`);
  console.log('');

  // Check SSL certificate
  const certPath = path.join(__dirname, '../root.crt');
  const certExists = fs.existsSync(certPath);
  console.log(`📜 SSL Certificate: ${certExists ? '✅ Found' : '❌ Not Found'}`);
  console.log('');

  // SSL configuration
  let sslConfig: any = false;
  
  if (process.env.DB_SSL === 'true') {
    if (certExists) {
      sslConfig = {
        ca: fs.readFileSync(certPath).toString(),
        rejectUnauthorized: false,
      };
      console.log('🔐 Using SSL with certificate (rejectUnauthorized: false)');
    } else {
      sslConfig = {
        rejectUnauthorized: false,
      };
      console.log('🔐 Using SSL without certificate (rejectUnauthorized: false)');
    }
  } else {
    console.log('⚠️  SSL is disabled');
  }
  console.log('');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 1,
    connectionTimeoutMillis: 30000,
    ssl: sslConfig,
  });

  try {
    console.log('🔌 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!\n');

    // Test query
    console.log('📊 Running test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Query successful!\n');
    console.log('   Current Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version);
    console.log('');

    // Check transactions table
    console.log('📋 Checking transactions table...');
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count FROM transactions
    `);
    console.log(`✅ Transactions table exists with ${tableCheck.rows[0].count} records\n`);

    client.release();
    
    console.log('🎉 Database connection is working perfectly!\n');
    
  } catch (error: any) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('timeout')) {
      console.error('💡 Possible solutions:');
      console.error('   1. Add your IP to YugabyteDB Cloud allowlist');
      console.error('   2. Check if your firewall is blocking port 5433');
      console.error('   3. Verify the hostname is correct');
      console.error('');
      console.error('📍 To add your IP to YugabyteDB:');
      console.error('   1. Go to YugabyteDB Cloud dashboard');
      console.error('   2. Click on your cluster "dreamy-quelea"');
      console.error('   3. Go to Network Access → IP Allow List');
      console.error('   4. Add your current IP or 0.0.0.0/0 (allow all - for testing only)');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Possible solutions:');
      console.error('   1. Check username and password in .env');
      console.error('   2. Verify credentials in YugabyteDB dashboard');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Possible solutions:');
      console.error('   1. Check DB_HOST in .env is correct');
      console.error('   2. Verify DNS resolution is working');
    }
    console.error('');
  } finally {
    await pool.end();
  }
}

testConnection();
