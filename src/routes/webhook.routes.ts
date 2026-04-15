import { Router } from 'express';
import webhookController from '../controllers/webhook.controller';

const router = Router();

/**
 * @route   POST /api/webhooks/xendit
 * @desc    Handle Xendit payment webhook callback
 * @access  Public (secured by callback token)
 */
router.post('/xendit', webhookController.handleXenditWebhook.bind(webhookController));

/**
 * @route   GET /api/webhooks/test
 * @desc    Test webhook endpoint
 * @access  Public
 */
router.get('/test', webhookController.testWebhook.bind(webhookController));

export default router;
