# 🎮 Tokonomad Backend API

Robust Node.js backend API for the Tokonomad game top-up platform with Xendit payment gateway integration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Xendit Integration](#xendit-integration)
- [Project Structure](#project-structure)

## ✨ Features

- ✅ **Transaction Management** - Create and manage game top-up transactions
- ✅ **Xendit Payment Integration** - Real-time payment processing with Xendit
- ✅ **Webhook Handler** - Secure webhook endpoint for payment notifications
- ✅ **PostgreSQL Database** - Reliable data persistence
- ✅ **TypeScript** - Full type safety across the application
- ✅ **RESTful API** - Clean and intuitive API design
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Security** - Helmet.js security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Payment Gateway**: Xendit
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Process Manager**: Nodemon (dev)

## 📦 Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm or yarn
- Xendit account and API keys

## 🚀 Installation

1. **Clone or navigate to the backend directory:**

```bash
cd tokonomad-be
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure your environment variables** (see Configuration section)

## ⚙️ Configuration

Edit the `.env` file with your actual configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tokonomad
DB_USER=postgres
DB_PASSWORD=your_password_here

# Xendit Configuration
XENDIT_SECRET_KEY=your_xendit_secret_key_here
XENDIT_WEBHOOK_TOKEN=your_xendit_webhook_token_here
XENDIT_PUBLIC_KEY=your_xendit_public_key_here

# Application Configuration
APP_NAME=Tokonomad
APP_URL=http://localhost:3000
API_URL=http://localhost:3001

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Service Fee Configuration (percentage)
SERVICE_FEE_PERCENTAGE=5
```

### Getting Xendit API Keys

1. Sign up at [Xendit Dashboard](https://dashboard.xendit.co/)
2. Navigate to **Settings** > **API Keys**
3. Copy your **Secret Key** and **Public Key**
4. Set up a **Webhook URL** in Settings > **Webhooks**
5. Generate and copy your **Webhook Token**

## 💾 Database Setup

1. **Create PostgreSQL database:**

```bash
psql -U postgres
CREATE DATABASE tokonomad;
\q
```

2. **Database tables will be automatically created** when you start the server for the first time.

The application will create the following tables:
- `transactions` - Stores all transaction data

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reload using nodemon.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

### Server will start on:
```
http://localhost:3001
```

## 📡 API Endpoints

### Health Check

**GET** `/api/health`

Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 1. Create Transaction

**POST** `/api/transactions`

Create a new transaction and generate Xendit payment invoice.

**Request Body:**
```json
{
  "userId": "123456789",
  "zoneId": "8888",
  "gameId": "ml",
  "gameName": "Mobile Legends",
  "productId": "ml-regular-1",
  "productName": "86 Diamonds",
  "productDescription": "86 Diamonds Mobile Legends",
  "amount": 20000,
  "paymentMethod": "qris"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "TRX1234567890",
      "external_id": "TOKONOMAD-uuid-here",
      "user_id": "123456789",
      "zone_id": "8888",
      "game_id": "ml",
      "game_name": "Mobile Legends",
      "product_id": "ml-regular-1",
      "product_name": "86 Diamonds",
      "amount": 20000,
      "service_fee": 1000,
      "payment_fee": 0,
      "total": 21000,
      "status": "PENDING",
      "xendit_invoice_id": "xendit-invoice-id",
      "xendit_invoice_url": "https://checkout.xendit.co/...",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "paymentUrl": "https://checkout.xendit.co/...",
    "expiryDate": "2024-01-16T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Transaction by ID

**GET** `/api/transactions/:id`

Retrieve a specific transaction by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": "TRX1234567890",
    "external_id": "TOKONOMAD-uuid-here",
    "user_id": "123456789",
    "zone_id": "8888",
    "game_id": "ml",
    "game_name": "Mobile Legends",
    "product_id": "ml-regular-1",
    "product_name": "86 Diamonds",
    "amount": 20000,
    "service_fee": 1000,
    "payment_fee": 0,
    "total": 21000,
    "payment_method": "qris",
    "status": "PAID",
    "paid_at": "2024-01-15T11:00:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "timestamp": "2024-01-15T11:05:00.000Z"
}
```

### 3. Get All Transactions (with pagination)

**GET** `/api/transactions`

Retrieve transactions with optional filters and pagination.

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `status` (optional) - Filter by status (PENDING, PAID, EXPIRED, FAILED)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `sortBy` (optional, default: created_at) - Sort field
- `sortOrder` (optional, default: DESC) - Sort order (ASC/DESC)

**Example:**
```
GET /api/transactions?userId=123456789&status=PAID&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": "TRX1234567890",
      "user_id": "123456789",
      "game_name": "Mobile Legends",
      "product_name": "86 Diamonds",
      "total": 21000,
      "status": "PAID",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "timestamp": "2024-01-15T11:05:00.000Z"
}
```

### 4. Xendit Webhook Handler

**POST** `/api/webhooks/xendit`

Receive payment status updates from Xendit.

**Headers:**
```
x-callback-token: your-xendit-webhook-token
```

**Request Body (from Xendit):**
```json
{
  "id": "xendit-invoice-id",
  "external_id": "TOKONOMAD-uuid-here",
  "status": "PAID",
  "amount": 21000,
  "paid_at": "2024-01-15T11:00:00.000Z",
  "payment_channel": "QRIS",
  "payment_method": "QRIS"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "transaction_id": "TRX1234567890",
    "status": "PAID"
  }
}
```

## 🔐 Xendit Integration

### Setup Xendit Webhook

1. Go to [Xendit Dashboard](https://dashboard.xendit.co/)
2. Navigate to **Settings** > **Webhooks**
3. Add a new webhook URL: `https://your-domain.com/api/webhooks/xendit`
4. Select event: **Invoice Paid**
5. Generate and save the **Callback Token**
6. Add the token to your `.env` file as `XENDIT_WEBHOOK_TOKEN`

### Testing Webhook Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3001

# Use the ngrok URL in Xendit webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/xendit
```

### Payment Flow

1. **Frontend** → Sends order data to `POST /api/transactions`
2. **Backend** → Creates transaction in database
3. **Backend** → Creates Xendit invoice
4. **Backend** → Returns payment URL to frontend
5. **Frontend** → Redirects user to Xendit payment page
6. **User** → Completes payment on Xendit
7. **Xendit** → Sends webhook to `POST /api/webhooks/xendit`
8. **Backend** → Updates transaction status to PAID
9. **Frontend** → Polls or checks transaction status

## 📁 Project Structure

```
tokonomad-be/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection config
│   ├── controllers/
│   │   ├── transaction.controller.ts  # Transaction endpoints
│   │   └── webhook.controller.ts      # Webhook handler
│   ├── middleware/
│   │   ├── errorHandler.ts      # Error handling middleware
│   │   └── requestLogger.ts     # Request logging
│   ├── routes/
│   │   ├── index.ts             # Main router
│   │   ├── transaction.routes.ts
│   │   └── webhook.routes.ts
│   ├── services/
│   │   ├── transaction.service.ts  # Transaction business logic
│   │   └── xendit.service.ts       # Xendit API integration
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Transaction Status Flow

```
PENDING → Payment link sent to user
    ↓
   PAID → Payment confirmed by Xendit
    ↓
EXPIRED → Payment link expired (default: 24 hours)
    ↓
FAILED → Payment failed
    ↓
CANCELLED → Transaction cancelled
```

## 🧪 Testing the API

### Using cURL

**Create Transaction:**
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123456789",
    "zoneId": "8888",
    "gameId": "ml",
    "gameName": "Mobile Legends",
    "productId": "ml-regular-1",
    "productName": "86 Diamonds",
    "amount": 20000,
    "paymentMethod": "qris"
  }'
```

**Get Transaction:**
```bash
curl http://localhost:3001/api/transactions/TRX1234567890
```

**Get All Transactions:**
```bash
curl "http://localhost:3001/api/transactions?userId=123456789&status=PAID&page=1&limit=10"
```

### Using Postman

Import the following endpoints:
1. Health Check: `GET http://localhost:3001/api/health`
2. Create Transaction: `POST http://localhost:3001/api/transactions`
3. Get Transaction: `GET http://localhost:3001/api/transactions/:id`
4. List Transactions: `GET http://localhost:3001/api/transactions`

## 🔗 Frontend Integration

Update your Next.js frontend to use this API:

```typescript
// Example: Create transaction from frontend
const createTransaction = async (orderData: any) => {
  const response = await fetch('http://localhost:3001/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: orderData.userId,
      zoneId: orderData.zoneId,
      gameId: orderData.gameId,
      gameName: orderData.gameName,
      productId: orderData.productId,
      productName: orderData.productName,
      amount: orderData.amount,
      paymentMethod: orderData.paymentMethod,
    }),
  });

  const result = await response.json();

  if (result.success) {
    // Redirect to Xendit payment page
    window.location.href = result.data.paymentUrl;
  }
};
```

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Keep credentials secure
2. **Use HTTPS in production** - Encrypt data in transit
3. **Validate webhook tokens** - Verify Xendit callbacks
4. **Sanitize user inputs** - Prevent SQL injection
5. **Rate limiting** - Add rate limiting middleware (future improvement)
6. **Monitor logs** - Track suspicious activities

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `tokonomad` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `XENDIT_SECRET_KEY` | Xendit secret key | `xnd_...` |
| `XENDIT_WEBHOOK_TOKEN` | Xendit webhook token | `your_token` |
| `CORS_ORIGIN` | Allowed origin | `http://localhost:3000` |
| `SERVICE_FEE_PERCENTAGE` | Service fee % | `5` |

## 🚀 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create tokonomad-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set XENDIT_SECRET_KEY=your_key
heroku config:set XENDIT_WEBHOOK_TOKEN=your_token

# Deploy
git push heroku main
```

### Deploy to Railway

1. Connect your GitHub repo
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

ISC

---

**Built with ❤️ for Tokonomad Platform**
