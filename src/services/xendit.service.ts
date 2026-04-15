import { XenditInvoice } from '../types';

// Check if we're using mock mode (no valid Xendit key)
const USE_MOCK = !process.env.XENDIT_SECRET_KEY || !process.env.XENDIT_SECRET_KEY.startsWith('xnd_');

export class XenditService {
  /**
   * Create a Xendit Invoice for payment (MOCK MODE for development)
   */
  async createInvoice(params: {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description: string;
    currency?: string;
    invoiceDuration?: number;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  }): Promise<XenditInvoice> {
    if (USE_MOCK) {
      return this.createMockInvoice(params);
    }

    // Real Xendit implementation would go here
    // For now, we'll use mock for all cases
    return this.createMockInvoice(params);
  }

  /**
   * Create a mock invoice for development/testing
   */
  private createMockInvoice(params: {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description: string;
    currency?: string;
    invoiceDuration?: number;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  }): XenditInvoice {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (params.invoiceDuration || 86400) * 1000);
    const mockInvoiceId = `mock_inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🎭 Using MOCK Xendit Invoice (development mode)');

    return {
      id: mockInvoiceId,
      external_id: params.externalId,
      user_id: '',
      status: 'PENDING',
      merchant_name: 'Tokonomad (DEV)',
      merchant_profile_picture_url: 'https://via.placeholder.com/150',
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      invoice_url: `http://localhost:3001/mock-payment/${mockInvoiceId}`,
      expiry_date: expiryDate.toISOString(),
      available_banks: [],
      available_retail_outlets: [],
      available_ewallets: [],
      should_exclude_credit_card: false,
      should_send_email: false,
      created: now.toISOString(),
      updated: now.toISOString(),
      currency: params.currency || 'IDR',
      payment_method: undefined,
      payment_channel: undefined,
      payment_destination: undefined,
    };
  }

  /**
   * Get invoice by ID (MOCK)
   */
  async getInvoiceById(invoiceId: string): Promise<XenditInvoice | null> {
    if (USE_MOCK) {
      console.log('🎭 Mock: Getting invoice by ID:', invoiceId);
      return null; // In mock mode, we don't store invoices
    }

    // Real Xendit implementation would go here
    return null;
  }

  /**
   * Expire an invoice (MOCK)
   */
  async expireInvoice(invoiceId: string): Promise<XenditInvoice> {
    if (USE_MOCK) {
      console.log('🎭 Mock: Expiring invoice:', invoiceId);
      const now = new Date();

      return {
        id: invoiceId,
        external_id: `TOKONOMAD-${invoiceId}`,
        user_id: '',
        status: 'EXPIRED',
        merchant_name: 'Tokonomad (DEV)',
        merchant_profile_picture_url: 'https://via.placeholder.com/150',
        amount: 0,
        payer_email: undefined,
        description: 'Expired invoice',
        invoice_url: `http://localhost:3001/mock-payment/${invoiceId}`,
        expiry_date: now.toISOString(),
        available_banks: [],
        available_retail_outlets: [],
        available_ewallets: [],
        should_exclude_credit_card: false,
        should_send_email: false,
        created: now.toISOString(),
        updated: now.toISOString(),
        currency: 'IDR',
        payment_method: undefined,
        payment_channel: undefined,
        payment_destination: undefined,
      };
    }

    // Real Xendit implementation would go here
    throw new Error('Expire invoice not implemented for real Xendit');
  }

  /**
   * Verify webhook callback token
   */
  verifyWebhookToken(callbackToken: string): boolean {
    if (USE_MOCK) {
      // In mock mode, accept any token or the test token
      console.log('🎭 Mock: Webhook token verification');
      return callbackToken === 'test_webhook_token' || callbackToken === process.env.XENDIT_WEBHOOK_TOKEN;
    }

    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN || '';
    return callbackToken === expectedToken;
  }
}

export default new XenditService();
