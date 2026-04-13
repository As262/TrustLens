import express from 'express';
import {
  submitTransaction,
  getUserTransactions,
  getTrustScore,
  getFraudLog,
} from '../controllers/transactionController.js';

const router = express.Router();

/**
 * Transaction Routes
 */

// POST: Submit new transaction for fraud detection
router.post('/', submitTransaction);

// GET: Retrieve user transactions
router.get('/user/:userId', getUserTransactions);

// GET: Get user trust score and insights
router.get('/trust-score/:userId', getTrustScore);

// GET: Get detailed fraud analysis for a transaction
router.get('/fraud-log/:transactionId', getFraudLog);

export default router;
