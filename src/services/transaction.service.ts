import { query } from '../config/database';
import { Transaction, TransactionStatus, CreateTransactionRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TRX${timestamp}${random}`;
  }

  /**
   * Generate unique external ID for Xendit
   */
  private generateExternalId(): string {
    return `TOKONOMAD-${uuidv4()}`;
  }

  /**
   * Calculate service fee
   */
  private calculateServiceFee(amount: number): number {
    const feePercentage = parseFloat(process.env.SERVICE_FEE_PERCENTAGE || '5');
    return Math.round(amount * (feePercentage / 100));
  }

  /**
   * Get payment fee based on payment method
   */
  private getPaymentFee(paymentMethod?: string): number {
    const fees: Record<string, number> = {
      qris: 0,
      dana: 500,
      ovo: 500,
      gopay: 500,
      shopeepay: 500,
      bca: 4000,
      mandiri: 4000,
      bni: 4000,
      bri: 4000,
      alfamart: 2500,
      indomaret: 2500,
    };

    return fees[paymentMethod?.toLowerCase() || ''] || 0;
  }

  /**
   * Create a new transaction
   */
  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const id = this.generateTransactionId();
    const externalId = this.generateExternalId();
    const serviceFee = this.calculateServiceFee(data.amount);
    const paymentFee = this.getPaymentFee(data.paymentMethod);
    const total = data.amount + serviceFee + paymentFee;

    const insertQuery = `
      INSERT INTO transactions (
        id, external_id, user_id, zone_id, game_id, game_name,
        product_id, product_name, product_description, amount,
        service_fee, payment_fee, total, payment_method, payment_channel, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      id,
      externalId,
      data.userId,
      data.zoneId || null,
      data.gameId,
      data.gameName,
      data.productId,
      data.productName,
      data.productDescription || null,
      data.amount,
      serviceFee,
      paymentFee,
      total,
      data.paymentMethod || null,
      data.paymentChannel || null,
      TransactionStatus.PENDING,
    ];

    try {
      const result = await query(insertQuery, values);
      return this.mapRowToTransaction(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Update transaction with Xendit details
   */
  async updateTransactionWithXendit(
    transactionId: string,
    xenditInvoiceId: string,
    xenditInvoiceUrl: string,
    xenditExpiryDate: string
  ): Promise<Transaction | null> {
    const updateQuery = `
      UPDATE transactions
      SET xendit_invoice_id = $1,
          xendit_invoice_url = $2,
          xendit_expiry_date = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    try {
      const result = await query(updateQuery, [
        xenditInvoiceId,
        xenditInvoiceUrl,
        xenditExpiryDate,
        transactionId,
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToTransaction(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating transaction with Xendit:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    externalId: string,
    status: TransactionStatus,
    paidAt?: Date
  ): Promise<Transaction | null> {
    const updateQuery = `
      UPDATE transactions
      SET status = $1,
          paid_at = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $3
      RETURNING *
    `;

    try {
      const result = await query(updateQuery, [status, paidAt || null, externalId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToTransaction(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    const selectQuery = 'SELECT * FROM transactions WHERE id = $1';

    try {
      const result = await query(selectQuery, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToTransaction(result.rows[0]);
    } catch (error: any) {
      console.error('Error getting transaction by ID:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction by external ID
   */
  async getTransactionByExternalId(externalId: string): Promise<Transaction | null> {
    const selectQuery = 'SELECT * FROM transactions WHERE external_id = $1';

    try {
      const result = await query(selectQuery, [externalId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToTransaction(result.rows[0]);
    } catch (error: any) {
      console.error('Error getting transaction by external ID:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get transactions with pagination and filters
   */
  async getTransactions(params: {
    userId?: string;
    status?: TransactionStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const { userId, status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = params;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userId) {
      conditions.push(`user_id = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM transactions ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get transactions
    const selectQuery = `
      SELECT * FROM transactions
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    try {
      const result = await query(selectQuery, values);
      const transactions = result.rows.map(row => this.mapRowToTransaction(row));

      return { transactions, total };
    } catch (error: any) {
      console.error('Error getting transactions:', error);
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Map database row to Transaction object
   */
  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      external_id: row.external_id,
      user_id: row.user_id,
      zone_id: row.zone_id,
      game_id: row.game_id,
      game_name: row.game_name,
      product_id: row.product_id,
      product_name: row.product_name,
      product_description: row.product_description,
      amount: parseFloat(row.amount),
      service_fee: parseFloat(row.service_fee),
      payment_fee: parseFloat(row.payment_fee),
      total: parseFloat(row.total),
      payment_method: row.payment_method,
      payment_channel: row.payment_channel,
      status: row.status as TransactionStatus,
      xendit_invoice_id: row.xendit_invoice_id,
      xendit_invoice_url: row.xendit_invoice_url,
      xendit_expiry_date: row.xendit_expiry_date,
      paid_at: row.paid_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export default new TransactionService();
