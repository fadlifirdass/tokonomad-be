import { Request, Response } from 'express';
import transactionService from '../services/transaction.service';
import xenditService from '../services/xendit.service';
import { XenditWebhookPayload, TransactionStatus } from '../types';

export class WebhookController {
  /**
   * Handle Xendit webhook callback
   * POST /api/webhooks/xendit
   */
  async handleXenditWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook token
      const callbackToken = req.headers['x-callback-token'] as string;

      if (!callbackToken || !xenditService.verifyWebhookToken(callbackToken)) {
        console.error('Invalid webhook token');
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid callback token',
        });
        return;
      }

      const payload: XenditWebhookPayload = req.body;

      console.log('Xendit webhook received:', {
        id: payload.id,
        external_id: payload.external_id,
        status: payload.status,
        amount: payload.amount,
      });

      // Get transaction by external_id
      const transaction = await transactionService.getTransactionByExternalId(payload.external_id);

      if (!transaction) {
        console.error('Transaction not found for external_id:', payload.external_id);
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      // Map Xendit status to our transaction status
      let newStatus: TransactionStatus;
      let paidAt: Date | undefined;

      switch (payload.status.toUpperCase()) {
        case 'PAID':
        case 'SETTLED':
          newStatus = TransactionStatus.PAID;
          paidAt = payload.paid_at ? new Date(payload.paid_at) : new Date();
          break;

        case 'EXPIRED':
          newStatus = TransactionStatus.EXPIRED;
          break;

        case 'FAILED':
          newStatus = TransactionStatus.FAILED;
          break;

        default:
          console.log('Unhandled Xendit status:', payload.status);
          res.status(200).json({ success: true, message: 'Webhook received' });
          return;
      }

      // Update transaction status
      const updatedTransaction = await transactionService.updateTransactionStatus(
        payload.external_id,
        newStatus,
        paidAt
      );

      if (!updatedTransaction) {
        console.error('Failed to update transaction status');
        res.status(500).json({
          success: false,
          message: 'Failed to update transaction',
        });
        return;
      }

      console.log('Transaction updated:', {
        id: updatedTransaction.id,
        status: updatedTransaction.status,
        paid_at: updatedTransaction.paid_at,
      });

      // Log webhook event (optional - for auditing)
      await this.logWebhookEvent(payload, transaction.id);

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        data: {
          transaction_id: updatedTransaction.id,
          status: updatedTransaction.status,
        },
      });
    } catch (error: any) {
      console.error('Error processing Xendit webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: error.message,
      });
    }
  }

  /**
   * Log webhook event for auditing purposes
   */
  private async logWebhookEvent(payload: XenditWebhookPayload, transactionId: string): Promise<void> {
    try {
      // Optional: You can create a webhook_logs table to store webhook events
      console.log('Webhook event logged:', {
        transaction_id: transactionId,
        external_id: payload.external_id,
        xendit_id: payload.id,
        status: payload.status,
        amount: payload.amount,
        paid_amount: payload.paid_amount,
        payment_method: payload.payment_method,
        payment_channel: payload.payment_channel,
        timestamp: new Date().toISOString(),
      });

      // TODO: Implement database logging if needed
      // await query('INSERT INTO webhook_logs ...');
    } catch (error) {
      console.error('Error logging webhook event:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Test webhook endpoint
   * GET /api/webhooks/test
   */
  async testWebhook(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString(),
    });
  }
}

export default new WebhookController();
