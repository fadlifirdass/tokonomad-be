# 🔗 Frontend Integration Guide

Complete guide for integrating the Tokonomad Backend API with your Next.js frontend.

## 📋 Overview

This guide shows how to replace the current mock localStorage implementation with real API calls to the backend.

## 🔧 Frontend Updates Required

### 1. Update Environment Variables

Create/update `.env.local` in your Next.js frontend (`tokonomad` folder):

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Create API Service Layer

Create `src/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
}

export const api = {
  // Create transaction
  createTransaction: async (data: CreateTransactionRequest) => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }
    
    return response.json();
  },

  // Get transaction by ID
  getTransaction: async (transactionId: string) => {
    const response = await fetch(`${API_URL}/api/transactions/${transactionId}`);
    
    if (!response.ok) {
      throw new Error('Transaction not found');
    }
    
    return response.json();
  },

  // Get user transactions
  getUserTransactions: async (userId: string, page = 1, limit = 10) => {
    const response = await fetch(
      `${API_URL}/api/transactions?userId=${userId}&page=${page}&limit=${limit}&sortOrder=DESC`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return response.json();
  },
};
```

### 3. Update Game Page (`src/app/game/[slug]/page.tsx`)

Replace the order creation logic:

```typescript
// OLD CODE (remove this):
const handleOrder = useCallback(() => {
  // ... validation ...
  
  const transactionId = `TRX${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const orderData = { ... };
  localStorage.setItem(`order_${transactionId}`, JSON.stringify(orderData));
  router.push(`/checkout/${transactionId}`);
}, [...]);

// NEW CODE (replace with this):
const handleOrder = useCallback(async () => {
  // ... existing validation ...
  
  if (Object.keys(newErrors).length > 0) {
    // ... error handling ...
    return;
  }

  setIsProcessing(true);

  try {
    // Create transaction via API
    const result = await api.createTransaction({
      userId: gameId,
      zoneId: serverId || undefined,
      gameId: game.id,
      gameName: game.name,
      productId: selectedPackage.id,
      productName: selectedPackage.description || `${selectedPackage.amount} Diamonds`,
      productDescription: selectedPackage.description,
      amount: selectedPackage.price,
    });

    if (result.success) {
      // Store transaction ID for reference
      localStorage.setItem('currentTransactionId', result.data.transaction.id);
      
      // Redirect to checkout page
      router.push(`/checkout/${result.data.transaction.id}`);
    } else {
      setErrorMessage('Gagal membuat transaksi. Silakan coba lagi.');
      setShowErrorModal(true);
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    setShowErrorModal(true);
  } finally {
    setIsProcessing(false);
  }
}, [gameId, serverId, selectedPackage, game, router]);
```

### 4. Update Checkout Page (`src/app/checkout/[id]/page.tsx`)

Replace localStorage logic with API calls:

```typescript
'use client';

import { use, useState, useMemo, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch transaction data from API
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const result = await api.getTransaction(id);
        if (result.success) {
          setOrderData({
            id: result.data.id,
            game: {
              name: result.data.game_name,
              icon: '/path/to/icon', // You'll need to handle this
            },
            product: {
              name: result.data.product_name,
            },
            userId: result.data.user_id,
            price: result.data.amount,
            serviceFee: result.data.service_fee,
            total: result.data.total,
          });
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, router]);

  // Handle payment
  const handlePayment = useCallback(async () => {
    if (!selectedPayment || !orderData) return;

    setIsProcessing(true);

    try {
      // In real implementation, update transaction with payment method
      // Then redirect to Xendit payment page
      
      // For now, redirect to order status page
      setTimeout(() => {
        router.push(`/order/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPayment, orderData, id, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!orderData) {
    notFound();
  }

  // ... rest of component ...
}
```

### 5. Update Order Status Page (`src/app/order/[id]/page.tsx`)

Fetch transaction status from API:

```typescript
'use client';

import { use, useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function OrderPage({ params }: OrderPageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await api.getTransaction(id);
        if (result.success) {
          setOrder({
            id: result.data.id,
            status: result.data.status.toLowerCase(), // 'pending', 'paid', etc.
            date: new Date(result.data.created_at).toLocaleString('id-ID'),
            paymentMethod: result.data.payment_method || 'QRIS',
            game: {
              name: result.data.game_name,
              icon: mlbbIcon, // Use appropriate icon
            },
            product: {
              name: result.data.product_name,
              description: result.data.product_description,
            },
            userId: result.data.user_id,
            serverId: result.data.zone_id || '-',
            price: result.data.amount,
            serviceFee: result.data.service_fee,
            total: result.data.total,
            paid_at: result.data.paid_at,
            payment_url: result.data.xendit_invoice_url,
          });
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!order) return notFound();

  // ... rest of component ...
}
```

## 🔄 Complete Payment Flow

### Step-by-Step Implementation:

1. **User selects product** on game page
2. **Frontend calls** `POST /api/transactions`
3. **Backend creates** transaction + Xendit invoice
4. **Frontend receives** transaction ID + payment URL
5. **Frontend redirects** user to Xendit payment page
6. **User completes** payment on Xendit
7. **Xendit sends** webhook to backend
8. **Backend updates** transaction status to PAID
9. **Frontend polls** transaction status
10. **Frontend shows** success message

### Enhanced Order Flow with Xendit Redirect:

```typescript
const handleOrder = async () => {
  try {
    const result = await api.createTransaction({ ... });
    
    if (result.success) {
      // Redirect directly to Xendit payment page
      window.location.href = result.data.paymentUrl;
    }
  } catch (error) {
    // Handle error
  }
};
```

## 📊 Transaction Status Mapping

Map backend statuses to frontend display:

```typescript
const getStatusDisplay = (status: string) => {
  const statusMap = {
    'PENDING': {
      label: 'Menunggu Pembayaran',
      color: 'yellow',
      icon: '⏳'
    },
    'PAID': {
      label: 'Pembayaran Berhasil',
      color: 'green',
      icon: '✅'
    },
    'EXPIRED': {
      label: 'Kadaluarsa',
      color: 'red',
      icon: '❌'
    },
    'FAILED': {
      label: 'Pembayaran Gagal',
      color: 'red',
      icon: '❌'
    },
  };
  
  return statusMap[status] || statusMap['PENDING'];
};
```

## 🧪 Testing Integration

### 1. Start Backend
```bash
cd tokonomad-be
npm run dev
```

### 2. Start Frontend
```bash
cd tokonomad
npm run dev
```

### 3. Test Flow
1. Open http://localhost:3000
2. Select a game (e.g., Mobile Legends)
3. Enter user ID and select package
4. Click "Beli Sekarang"
5. Should create transaction and show checkout page
6. Complete payment (test mode)
7. Check transaction status

## 🔍 Debugging Tips

### Check API Connection
```typescript
// Add to a test page
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/health');
    const result = await response.json();
    console.log('API Health:', result);
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

### View Network Requests
- Open Chrome DevTools
- Go to Network tab
- Filter by "Fetch/XHR"
- Check request/response data

## 📱 Mobile Testing

Update CORS origin for mobile testing:

```env
# In backend .env
CORS_ORIGIN=http://192.168.1.100:3000
```

Access from mobile:
```
http://192.168.1.100:3000
```

## 🚀 Production Deployment

### Backend (Railway/Heroku)
1. Deploy backend first
2. Get production URL (e.g., `https://tokonomad-api.railway.app`)
3. Update Xendit webhook URL

### Frontend (Vercel)
1. Update environment variable:
```
NEXT_PUBLIC_API_URL=https://tokonomad-api.railway.app
```
2. Deploy frontend
3. Test complete flow

## ✅ Integration Checklist

- [ ] Backend API running on port 3001
- [ ] Frontend running on port 3000
- [ ] Environment variables configured
- [ ] API service layer created
- [ ] Game page updated
- [ ] Checkout page updated
- [ ] Order page updated
- [ ] Test transaction creation
- [ ] Test payment flow
- [ ] Test status updates

---

**Happy integrating! 🎮**
