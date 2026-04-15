import { Request, Response } from 'express';
import transactionService from '../services/transaction.service';
import xenditService from '../services/xendit.service';
import { CreateTransactionRequest, TransactionStatus, ApiResponse, PaginatedResponse } from '../types';

export class TransactionController {
  /**
   * Create a new transaction with Xendit invoice
   * POST /api/transactions
   */
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTransactionRequest = req.body;

      // Validate required fields
      if (!data.userId || !data.gameId || !data.gameName || !data.productId || !data.productName || !data.amount) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          error: 'userId, gameId, gameName, productId, productName, and amount are required',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Create transaction in database
      const transaction = await transactionService.createTransaction(data);

      // Create Xendit invoice
      const invoice = await xenditService.createInvoice({
        externalId: transaction.external_id,
        amount: transaction.total,
        description: `${transaction.game_name} - ${transaction.product_name}`,
        payerEmail: undefined, // Optional: can add email from request
        successRedirectUrl: `${process.env.APP_URL}/order/${transaction.id}`,
        failureRedirectUrl: `${process.env.APP_URL}/checkout/${transaction.id}`,
      });

      // Update transaction with Xendit details
      const updatedTransaction = await transactionService.updateTransactionWithXendit(
        transaction.id,
        invoice.id,
        invoice.invoice_url,
        invoice.expiry_date
      );

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: {
          transaction: updatedTransaction,
          paymentUrl: invoice.invoice_url,
          expiryDate: invoice.expiry_date,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  }

  /**
   * Get transaction by ID
   * GET /api/transactions/:id
   */
  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Transaction retrieved successfully',
        data: transaction,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      console.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction',
        error: error.message,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  }

  /**
   * Get transactions with pagination and filters
   * GET /api/transactions
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        status,
        page = '1',
        limit = '10',
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = req.query;

      const params = {
        userId: userId as string | undefined,
        status: status as TransactionStatus | undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC' as 'ASC' | 'DESC',
      };

      const { transactions, total } = await transactionService.getTransactions(params);

      const totalPages = Math.ceil(total / params.limit);

      res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages,
        },
        timestamp: new Date().toISOString(),
      } as PaginatedResponse);
    } catch (error: any) {
      console.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error.message,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  }
}

export default new TransactionController();
