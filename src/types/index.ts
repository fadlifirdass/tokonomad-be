// Transaction Types
export interface Transaction {
  id: string;
  external_id: string;
  user_id: string;
  zone_id?: string;
  game_id: string;
  game_name: string;
  product_id: string;
  product_name: string;
  product_description?: string;
  amount: number;
  service_fee: number;
  payment_fee: number;
  total: number;
  payment_method?: string;
  payment_channel?: string;
  status: TransactionStatus;
  xendit_invoice_id?: string;
  xendit_invoice_url?: string;
  xendit_expiry_date?: Date;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Create Transaction Request
export interface CreateTransactionRequest {
  userId: string;
  zoneId?: string;
  gameId: string;
  gameName: string;
  productId: string;
  productName: string;
  productDescription?: string;
  amount: number;
  paymentMethod?: string;
  paymentChannel?: string;
}

// Xendit Types
export interface XenditInvoice {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  payer_email?: string;
  description: string;
  invoice_url: string;
  expiry_date: string;
  available_banks?: any[];
  available_retail_outlets?: any[];
  available_ewallets?: any[];
  should_exclude_credit_card: boolean;
  should_send_email: boolean;
  created: string;
  updated: string;
  currency: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
}

export interface XenditWebhookPayload {
  id: string;
  external_id: string;
  user_id?: string;
  status: string;
  merchant_name?: string;
  amount: number;
  paid_amount?: number;
  bank_code?: string;
  paid_at?: string;
  payer_email?: string;
  description?: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  updated: string;
  created: string;
  currency: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Frontend Types (from existing tokonomad project)
export interface DiamondPackage {
  id: string;
  gameId: string;
  amount: number;
  bonus?: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  category?: 'regular' | 'first-topup' | 'weekly' | 'monthly' | 'special';
  description?: string;
  region?: string;
  imageUrl?: string;
}

export interface CartItem {
  type: 'diamond' | 'joki' | 'mabar';
  item: DiamondPackage;
  game: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  userGameId?: string;
}
