const Joi = require('joi');

const paymentSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  deviceId: Joi.string().required(),
  location: Joi.string().required(),
  cardDetails: Joi.object().optional() // Allow optional card details depending on frontend state
});

const validatePayment = (req, res, next) => {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }
    
    req.body = value; // Assign cleaned values back
    next();
};

module.exports = validatePayment;
