-- Tokonomad Database Schema
-- PostgreSQL Database Setup

-- Create database (run this first if database doesn't exist)
CREATE DATABASE tokonomad;

-- Connect to the database
\c tokonomad;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(100) PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    zone_id VARCHAR(100),
    game_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    payment_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_channel VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    xendit_invoice_id VARCHAR(100),
    xendit_invoice_url TEXT,
    xendit_expiry_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_game_id ON transactions(game_id);

-- Add check constraint for status values
ALTER TABLE transactions 
ADD CONSTRAINT check_status 
CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED'));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create webhook_logs table for auditing
CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100),
    external_id VARCHAR(100),
    xendit_id VARCHAR(100),
    event_type VARCHAR(50),
    status VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Create index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_external_id ON webhook_logs(external_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- Insert sample data for testing (optional)
INSERT INTO transactions (
    id, external_id, user_id, zone_id, game_id, game_name,
    product_id, product_name, product_description,
    amount, service_fee, payment_fee, total,
    payment_method, status
) VALUES 
(
    'TRX001', 
    'TOKONOMAD-SAMPLE-001', 
    '123456789', 
    '8888', 
    'ml', 
    'Mobile Legends',
    'ml-regular-1', 
    '86 Diamonds', 
    '86 Diamonds Mobile Legends',
    20000, 
    1000, 
    0, 
    21000,
    'qris',
    'PENDING'
),
(
    'TRX002', 
    'TOKONOMAD-SAMPLE-002', 
    '987654321', 
    '9999', 
    'ml', 
    'Mobile Legends',
    'ml-regular-2', 
    '172 Diamonds', 
    '172 Diamonds Mobile Legends',
    40000, 
    2000, 
    500, 
    42500,
    'dana',
    'PAID'
);

-- Query examples for reference:

-- 1. Get all transactions for a specific user
-- SELECT * FROM transactions WHERE user_id = '123456789' ORDER BY created_at DESC;

-- 2. Get all paid transactions
-- SELECT * FROM transactions WHERE status = 'PAID' ORDER BY paid_at DESC;

-- 3. Get transactions in the last 24 hours
-- SELECT * FROM transactions WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 4. Get revenue summary
-- SELECT 
--     COUNT(*) as total_transactions,
--     SUM(total) as total_revenue,
--     AVG(total) as average_transaction
-- FROM transactions 
-- WHERE status = 'PAID';

-- 5. Get transactions by game
-- SELECT 
--     game_id,
--     game_name,
--     COUNT(*) as transaction_count,
--     SUM(total) as total_revenue
-- FROM transactions 
-- WHERE status = 'PAID'
-- GROUP BY game_id, game_name;

-- Permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE tokonomad TO your_username;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
