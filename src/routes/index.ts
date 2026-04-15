import { Router } from 'express';
import transactionRoutes from './transaction.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/transactions', transactionRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
