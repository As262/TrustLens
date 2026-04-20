const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const FraudScoreService = require('../services/FraudScoreService');

// @desc    Process new payment
// @route   POST /api/pay
const processPayment = async (req, res) => {
    try {
        const { userId, amount, deviceId, location } = req.body;

        // 1. Fetch historical context for AI Engine rules
        const pastTransactions = await Transaction.find({ userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean(); // Faster reads and simple array mapping

        // Map formatting rules expected by FastAPI schemas
        const formattedHistory = pastTransactions.map(tx => ({
            id: tx._id.toString(),
            amount: tx.amount,
            deviceId: tx.deviceId,
            location: tx.location,
            isFlagged: tx.isFlagged,
            fraudScore: tx.fraudScore
        }));

        // 2. Call FastAPI for the Scoring & AI rules
        const aiResponse = await FraudScoreService.getTrustScore({
            userId,
            amount,
            deviceId,
            location,
            transactions: formattedHistory
        });

        const { score, riskLevel, decision, reasons } = aiResponse;

        // 3. Save the Transaction with AI decision
        const isFlagged = decision === 'block' || decision === 'review';
        const transaction = await Transaction.create({
            userId,
            amount,
            fraudScore: score,
            isFlagged,
            deviceId,
            location,
            decision,
            reasons
        });

        // 4. Update the User profile aggregations
        await User.findOneAndUpdate(
            { userId },
            {
                trustScore: score,
                riskLevel: riskLevel,
                $set: { lastTransactionAt: new Date() }
            },
            { upsert: true, new: true, runValidators: true }
        );

        // 5. Track device telemetry 
        if (deviceId) {
            await Device.findOneAndUpdate(
                { userId, deviceId },
                { $set: { lastUsed: new Date() } },
                { upsert: true, setDefaultsOnInsert: true }
            );
        }

        // 6. Output to the React dashboard cleanly
        res.status(200).json({
            success: true,
            transactionId: transaction._id,
            status: decision === 'allow' ? 'success' : (decision === 'block' ? 'rejected' : 'pending'),
            aiScore: {
                score,
                riskLevel,
                decision,
                reasons
            }
        });

    } catch (error) {
        console.error('Error Processing Payment Orchestration:', error);
        res.status(500).json({ success: false, error: 'Internal Payment Processing Error' });
    }
};

// @desc    Get transaction history
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(50);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get user risk profile
// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id });
        if (!user) return res.status(404).json({ error: 'User context not found' });
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    processPayment,
    getTransactions,
    getUserProfile
};
