import { Router } from 'express';
import transactionController from '../controllers/transaction.controller';

const router = Router();

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction with Xendit payment
 * @access  Public
 */
router.post('/', transactionController.createTransaction.bind(transactionController));

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with pagination and filters
 * @access  Public
 * @query   userId - Filter by user ID
 * @query   status - Filter by status (PENDING, PAID, EXPIRED, FAILED)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   sortBy - Sort field (default: created_at)
 * @query   sortOrder - Sort order (ASC/DESC, default: DESC)
 */
router.get('/', transactionController.getTransactions.bind(transactionController));

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Public
 */
router.get('/:id', transactionController.getTransaction.bind(transactionController));

export default router;
