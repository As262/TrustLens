import React, { useState } from 'react';
import { CreditCard, DollarSign, User, ShieldCheck, Loader2 } from 'lucide-react';

const PaymentForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    userId: 'user_123'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(formData.amount),
      cardDetails: {
        cardNumber: formData.cardNumber,
        expiry: formData.expiry,
        cvc: formData.cvc
      },
      userId: formData.userId
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <CreditCard className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Payment Details
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-400 ml-1">Amount ($)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="number"
              name="amount"
              required
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-400 ml-1">User ID</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              name="userId"
              required
              value={formData.userId}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="user_123"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-400 ml-1">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              name="cardNumber"
              required
              pattern="[\d\s]+"
              value={formData.cardNumber}
              onChange={handleChange}
              className="input-field pl-10 tracking-widest font-mono"
              placeholder="0000 0000 0000 0000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400 ml-1">Expiry</label>
            <input
              type="text"
              name="expiry"
              required
              placeholder="MM/YY"
              value={formData.expiry}
              onChange={handleChange}
              className="input-field text-center font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400 ml-1">CVC</label>
            <input
              type="text"
              name="cvc"
              required
              maxLength="4"
              value={formData.cvc}
              onChange={handleChange}
              className="input-field text-center font-mono"
              placeholder="123"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary mt-2 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Secure Pay
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
