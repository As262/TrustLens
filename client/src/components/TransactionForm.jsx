import React, { useState } from 'react';
import { Send } from 'lucide-react';

const TransactionForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    amount: '',
    location: '',
    deviceName: 'iPhone 14',
    category: 'shopping',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.location) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(formData);
    setFormData({
      amount: '',
      location: '',
      deviceName: 'iPhone 14',
      category: 'shopping',
    });
  };

  return (
    <div className="clay-card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transaction Amount ($)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            step="0.01"
            min="0"
            className="clay-input"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., New York, NYC"
            className="clay-input"
          />
        </div>

        {/* Device */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Device Name
          </label>
          <select
            name="deviceName"
            value={formData.deviceName}
            onChange={handleChange}
            className="clay-input"
          >
            <option value="iPhone 14">iPhone 14</option>
            <option value="MacBook Pro">MacBook Pro</option>
            <option value="iPad Air">iPad Air</option>
            <option value="Samsung Galaxy S23">Samsung Galaxy S23</option>
            <option value="Unknown Device">Unknown Device</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transaction Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="clay-input"
          >
            <option value="shopping">🛍️ Shopping</option>
            <option value="dining">🍴 Dining</option>
            <option value="utilities">💡 Utilities</option>
            <option value="entertainment">🎬 Entertainment</option>
            <option value="transfer">💸 Transfer</option>
            <option value="withdrawal">💰 Withdrawal</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`clay-button w-full mt-6 flex items-center justify-center gap-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Send className="w-5 h-5" />
          {loading ? 'Processing...' : 'Submit Transaction'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <p className="text-xs text-blue-800 font-semibold uppercase">ℹ️ How it works:</p>
        <p className="text-sm text-blue-900 mt-2">
          Our AI will analyze your transaction in real-time, checking for unusual patterns like
          amount anomalies, new locations, and device changes. Results are instant and 100%
          explainable.
        </p>
      </div>
    </div>
  );
};

export default TransactionForm;
