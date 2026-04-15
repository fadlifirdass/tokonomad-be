# 🚀 Quick Start Guide - Tokonomad Backend API

Get up and running with the Tokonomad backend API in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js 16+ installed (`node --version`)
- ✅ PostgreSQL 12+ installed and running
- ✅ Xendit account (sign up at https://dashboard.xendit.co/)

## Step 1: Install Dependencies

```bash
cd tokonomad-be
npm install
```

## Step 2: Setup PostgreSQL Database

### Option A: Using psql command line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tokonomad;

# Exit psql
\q
```

### Option B: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `tokonomad`
4. Click "Save"

## Step 3: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (update these!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tokonomad
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

# Xendit (get from https://dashboard.xendit.co/settings/developers#api-keys)
XENDIT_SECRET_KEY=xnd_development_YOUR_SECRET_KEY
XENDIT_WEBHOOK_TOKEN=YOUR_WEBHOOK_TOKEN_HERE
XENDIT_PUBLIC_KEY=xnd_public_development_YOUR_PUBLIC_KEY

# App URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Service Fee
SERVICE_FEE_PERCENTAGE=5
```

### Getting Xendit Keys:
1. Go to https://dashboard.xendit.co/
2. Navigate to **Settings** → **Developers** → **API Keys**
3. Copy your **Secret Key** (starts with `xnd_development_` for test mode)
4. Go to **Settings** → **Webhooks**
5. Generate a **Webhook Verification Token**

## Step 4: Start the Server

### Development mode (with hot reload):
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       🚀 TOKONOMAD API SERVER IS RUNNING 🚀          ║
║                                                       ║
║   Environment: development                            ║
║   Port:        3001                                   ║
║   URL:         http://localhost:3001                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

## Step 5: Test the API

### Test 1: Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Test 2: Create a Transaction

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

You should get a transaction with a Xendit payment URL!

### Test 3: Get Transaction

```bash
curl http://localhost:3001/api/transactions/TRX_ID_FROM_STEP_2
```

## Step 6: Setup Xendit Webhook (For Payment Notifications)

### For Local Development (using ngrok):

```bash
# Install ngrok
npm install -g ngrok

# In a new terminal, expose your local server
ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

Then in Xendit Dashboard:
1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook URL**
3. Enter: `https://abc123.ngrok.io/api/webhooks/xendit`
4. Select event: **Invoice Paid**
5. Save

Now when you make a payment, Xendit will send notifications to your local server!

## Common Issues & Solutions

### Issue: Database connection failed

**Solution:**
- Check PostgreSQL is running: `sudo service postgresql status` (Linux) or check Services (Windows)
- Verify database credentials in `.env`
- Make sure database `tokonomad` exists

### Issue: Xendit API error

**Solution:**
- Verify your Xendit secret key is correct
- Make sure you're using the right environment (development vs production)
- Check Xendit API status: https://status.xendit.co/

### Issue: CORS error from frontend

**Solution:**
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Restart the server after changing `.env`

### Issue: Port 3001 already in use

**Solution:**
```bash
# Option 1: Change port in .env
PORT=3002

# Option 2: Kill the process using port 3001 (Linux/Mac)
lsof -ti:3001 | xargs kill -9

# Option 2: Kill the process using port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

## Next Steps

✅ **Backend is running!** 

Now you can:

1. **Integrate with Frontend**: Update your Next.js frontend to call this API
2. **Test Payments**: Make a test payment using Xendit test mode
3. **View Documentation**: Check `README.md` and `API_DOCUMENTATION.md`
4. **Deploy**: Deploy to Heroku, Railway, or your preferred platform

## Testing with Xendit Test Mode

Xendit provides test mode for development. Use these test cards:

- **Success**: Card number `4000000000000002`
- **Failure**: Card number `4000000000000036`

For QRIS, use the Xendit simulator in the dashboard.

## Useful Commands

```bash
# Development
npm run dev          # Start with hot reload

# Production
npm run build        # Compile TypeScript
npm start            # Start production server

# Database
psql -U postgres -d tokonomad -f database-schema.sql  # Run SQL schema

# Logs
npm run dev | tee logs.txt  # Save logs to file
```

## Project Structure Quick Reference

```
tokonomad-be/
├── src/
│   ├── config/         # Database config
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── app.ts          # Express setup
│   └── server.ts       # Entry point
└── dist/               # Compiled JavaScript (after build)
```

## Support

- 📖 **Full Documentation**: See `README.md`
- 🔌 **API Reference**: See `API_DOCUMENTATION.md`
- 🐛 **Issues**: Create an issue in the repository

---

**Happy coding! 🎮**
