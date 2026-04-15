/**
 * Script to check database records
 * Run with: npx ts-node scripts/check-database.ts
 */

import { getDatabasePool, closeDatabasePool } from '../src/config/database';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    const pool = getDatabasePool();

    console.log('\n🔍 Checking database records...\n');

    // Get all transactions
    const result = await pool.query(`
      SELECT 
        id,
        external_id,
        user_id,
        zone_id,
        game_name,
        product_name,
        amount,
        service_fee,
        payment_fee,
        total,
        payment_method,
        status,
        paid_at,
        created_at
      FROM transactions
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (result.rows.length === 0) {
      console.log('❌ No transactions found in database\n');
      return;
    }

    console.log(`✅ Found ${result.rows.length} transactions:\n`);
    console.log('='.repeat(100));

    result.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Transaction ID: ${row.id}`);
      console.log(`   External ID: ${row.external_id}`);
      console.log(`   User ID: ${row.user_id} (Zone: ${row.zone_id || 'N/A'})`);
      console.log(`   Game: ${row.game_name}`);
      console.log(`   Product: ${row.product_name}`);
      console.log(`   Amount: Rp ${row.amount.toLocaleString()}`);
      console.log(`   Service Fee: Rp ${row.service_fee.toLocaleString()}`);
      console.log(`   Payment Fee: Rp ${row.payment_fee.toLocaleString()}`);
      console.log(`   Total: Rp ${row.total.toLocaleString()}`);
      console.log(`   Payment Method: ${row.payment_method || 'N/A'}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Paid At: ${row.paid_at || 'Not paid yet'}`);
      console.log(`   Created: ${row.created_at}`);
      console.log('-'.repeat(100));
    });

    // Get statistics
    const stats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total) as total_amount
      FROM transactions
      GROUP BY status
    `);

    console.log('\n📊 Transaction Statistics:\n');
    stats.rows.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} transactions (Total: Rp ${parseFloat(stat.total_amount).toLocaleString()})`);
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await closeDatabasePool();
    console.log('Database connection closed\n');
  }
}

checkDatabase();
