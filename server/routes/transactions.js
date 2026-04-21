import express from 'express';
import {
  analyzeTransaction,
  submitTransaction,
  getPayeeProfile,
  getWebsiteDatabase,
  getUserTransactions,
  getTrustScore,
  getFraudLog,
  approveTransaction,
  resolveUpiId,
} from '../controllers/transactionController.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Transaction Routes
 */

// POST: Submit new transaction for fraud detection
router.post('/analyze', transactionLimiter, analyzeTransaction);
router.post('/', transactionLimiter, submitTransaction);

// GET: Retrieve user transactions
router.get('/user/:userId', getUserTransactions);

// GET: Sender trust and inbound payee reputation
router.get('/payee-profile/:userId', getPayeeProfile);

// GET: Website reputation database used by risk engine
router.get('/websites', getWebsiteDatabase);

// GET: Get user trust score and insights
router.get('/trust-score/:userId', getTrustScore);

// GET: Get detailed fraud analysis for a transaction
router.get('/fraud-log/:transactionId', getFraudLog);

// GET: Resolve a UPI ID to account holder name
router.get('/resolve-upi/:upiId', resolveUpiId);

// PUT: Manually approve transaction
router.put('/:transactionId/approve', approveTransaction);

export default router;
