# 📚 Tokonomad API Documentation

Complete API reference for integrating with the Tokonomad backend.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

Currently, the API is public. Future versions will include JWT authentication.

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Endpoints

### 1. Health Check

Check if the API is operational.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

### 2. Create Transaction

Create a new game top-up transaction and generate Xendit payment invoice.

**Endpoint:** `POST /transactions`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "string (required)",
  "zoneId": "string (optional)",
  "gameId": "string (required)",
  "gameName": "string (required)",
  "productId": "string (required)",
  "productName": "string (required)",
  "productDescription": "string (optional)",
  "amount": "number (required)",
  "paymentMethod": "string (optional)"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User's game ID (e.g., Mobile Legends ID) |
| zoneId | string | No | Server/Zone ID (if applicable) |
| gameId | string | Yes | Game identifier (e.g., "ml", "ff", "pubg") |
| gameName | string | Yes | Full game name |
| productId | string | Yes | Product/Package ID |
| productName | string | Yes | Product display name |
| productDescription | string | No | Product details |
| amount | number | Yes | Product price in IDR |
| paymentMethod | string | No | Payment method (qris, dana, ovo, etc.) |

**Example Request:**
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

**Success Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "TRX1234567890",
      "external_id": "TOKONOMAD-abc123-def456",
      "user_id": "123456789",
      "zone_id": "8888",
      "game_id": "ml",
      "game_name": "Mobile Legends",
      "product_id": "ml-regular-1",
      "product_name": "86 Diamonds",
      "product_description": "86 Diamonds Mobile Legends",
      "amount": 20000,
      "service_fee": 1000,
      "payment_fee": 0,
      "total": 21000,
      "payment_method": "qris",
      "status": "PENDING",
      "xendit_invoice_id": "5f9a3fbd048619002130201b",
      "xendit_invoice_url": "https://checkout.xendit.co/web/abc123",
      "xendit_expiry_date": "2024-01-16T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "paymentUrl": "https://checkout.xendit.co/web/abc123",
    "expiryDate": "2024-01-16T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "userId, gameId, gameName, productId, productName, and amount are required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Get Transaction by ID

Retrieve details of a specific transaction.

**Endpoint:** `GET /transactions/:id`

**URL Parameters:**
- `id` - Transaction ID (e.g., TRX1234567890)

**Example Request:**
```
GET /transactions/TRX1234567890
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": "TRX1234567890",
    "external_id": "TOKONOMAD-abc123-def456",
    "user_id": "123456789",
    "zone_id": "8888",
    "game_id": "ml",
    "game_name": "Mobile Legends",
    "product_id": "ml-regular-1",
    "product_name": "86 Diamonds",
    "product_description": "86 Diamonds Mobile Legends",
    "amount": 20000,
    "service_fee": 1000,
    "payment_fee": 0,
    "total": 21000,
    "payment_method": "qris",
    "payment_channel": "QRIS",
    "status": "PAID",
    "xendit_invoice_id": "5f9a3fbd048619002130201b",
    "xendit_invoice_url": "https://checkout.xendit.co/web/abc123",
    "xendit_expiry_date": "2024-01-16T10:30:00.000Z",
    "paid_at": "2024-01-15T11:00:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "timestamp": "2024-01-15T11:05:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Transaction not found",
  "timestamp": "2024-01-15T11:05:00.000Z"
}
```

---

### 4. Get All Transactions

Retrieve a list of transactions with optional filtering and pagination.

**Endpoint:** `GET /transactions`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| userId | string | No | - | Filter by user game ID |
| status | string | No | - | Filter by status (PENDING, PAID, EXPIRED, FAILED, CANCELLED) |
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max: 100) |
| sortBy | string | No | created_at | Sort field |
| sortOrder | string | No | DESC | Sort order (ASC or DESC) |

**Example Requests:**
```
GET /transactions
GET /transactions?userId=123456789
GET /transactions?status=PAID
GET /transactions?userId=123456789&status=PAID&page=1&limit=20
GET /transactions?sortBy=total&sortOrder=DESC
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": "TRX1234567890",
      "external_id": "TOKONOMAD-abc123",
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

---

### 5. Xendit Webhook Handler

Receive payment status updates from Xendit (called automatically by Xendit).

**Endpoint:** `POST /webhooks/xendit`

**Request Headers:**
```
Content-Type: application/json
x-callback-token: your_xendit_webhook_token
```

**Request Body (sent by Xendit):**
```json
{
  "id": "5f9a3fbd048619002130201b",
  "external_id": "TOKONOMAD-abc123-def456",
  "status": "PAID",
  "amount": 21000,
  "paid_at": "2024-01-15T11:00:00.000Z",
  "payment_method": "QRIS",
  "payment_channel": "QRIS"
}
```

**Success Response (200):**
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

---

## Transaction Status Values

| Status | Description |
|--------|-------------|
| PENDING | Transaction created, waiting for payment |
| PAID | Payment successful |
| EXPIRED | Payment link expired (default: 24 hours) |
| FAILED | Payment failed |
| CANCELLED | Transaction cancelled by user or system |

---

## Payment Method Fees

| Payment Method | Fee (IDR) |
|----------------|-----------|
| QRIS | 0 |
| DANA | 500 |
| OVO | 500 |
| GoPay | 500 |
| ShopeePay | 500 |
| BCA VA | 4,000 |
| Mandiri VA | 4,000 |
| BNI VA | 4,000 |
| BRI VA | 4,000 |
| Alfamart | 2,500 |
| Indomaret | 2,500 |

---

**For complete integration examples and deployment instructions, see README.md**
