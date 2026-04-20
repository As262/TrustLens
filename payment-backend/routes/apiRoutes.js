const express = require('express');
const router = express.Router();
const { processPayment, getTransactions, getUserProfile } = require('../controllers/paymentController');
const paymentValidator = require('../middlewares/validation');

// Centralize the API Endpoints calling out to our Controllers
router.post('/pay', paymentValidator, processPayment);
router.get('/transactions', getTransactions);
router.get('/users/:id', getUserProfile);

module.exports = router;
