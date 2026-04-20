import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Alert from '../models/Alert.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Helper to generate missing alerts from flagged transactions
const generateMissingAlerts = async (userId) => {
  const flaggedTransactions = await Transaction.find({
    userId,
    isFlagged: true,
    alertCreated: { $ne: true }
  });

  if (flaggedTransactions.length > 0) {
    const newAlerts = flaggedTransactions.map(t => ({
      userId,
      type: 'fraud',
      severity: t.fraudScore > 0.8 ? 'critical' : 'high',
      message: `High risk transaction flagged: ${t.category || 'payment'} of $${t.amount} in ${t.location}.`,
      isRead: false,
      createdAt: t.timestamp,
      metadata: {
        transactionId: t._id,
        amount: t.amount,
        location: t.location,
        fraudScore: t.fraudScore,
        category: t.category
      }
    }));

    await Alert.insertMany(newAlerts);
    
    await Transaction.updateMany(
      { _id: { $in: flaggedTransactions.map(t => t._id) } },
      { $set: { alertCreated: true } }
    );
  }
};

// GET: All alerts for user (protected)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.userId };
    if (read !== undefined) {
      query.isRead = read === 'true';
    }

    await generateMissingAlerts(req.user.userId);

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET: Unread alert count
router.get('/unread/count', authMiddleware, async (req, res, next) => {
  try {
    await generateMissingAlerts(req.user.userId);

    const count = await Alert.countDocuments({
      userId: req.user.userId,
      isRead: false,
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Mark alert as read
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({
      success: true,
      data: { alert },
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Mark multiple alerts as read
router.put('/mark-all-read', authMiddleware, async (req, res, next) => {
  try {
    const result = await Alert.updateMany(
      {
        userId: req.user.userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      data: {
        message: `${result.modifiedCount} alerts marked as read`,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Clear all read alerts
router.delete('/clear-read', authMiddleware, async (req, res, next) => {
  try {
    const result = await Alert.deleteMany({
      userId: req.user.userId,
      isRead: true,
    });

    res.json({
      success: true,
      data: {
        message: `${result.deletedCount} read alerts cleared`,
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete specific alert
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await Alert.deleteOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({
      success: true,
      data: { message: 'Alert deleted' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
