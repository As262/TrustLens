import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const TransactionList = ({ transactions = [], onTransactionClick }) => {
  const getStatusIcon = (isFlagged) => {
    return isFlagged ? (
      <AlertCircle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  const getStatusColor = (isFlagged) => {
    return isFlagged ? 'bg-red-50' : 'bg-green-50';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      shopping: '🛍️',
      dining: '🍴',
      utilities: '💡',
      entertainment: '🎬',
      transfer: '💸',
      withdrawal: '💰',
    };
    return emojis[category] || '💳';
  };

  return (
    <div className="clay-card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h2>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-2">Submit a transaction to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              onClick={() => onTransactionClick && onTransactionClick(transaction)}
              className={`${getStatusColor(
                transaction.isFlagged
              )} clay-card cursor-pointer hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">
                    {getCategoryEmoji(transaction.category)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 capitalize">
                      {transaction.category}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.location}</p>
                  </div>
                </div>

                {/* Middle: Amount */}
                <div className="text-right mx-4">
                  <p className="font-bold text-lg text-gray-800">
                    ${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Right: Status */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(transaction.isFlagged)}
                  <span className="text-sm font-semibold text-gray-600">
                    {transaction.isFlagged ? 'Flagged' : 'Approved'}
                  </span>
                </div>
              </div>

              {/* Fraud Score bar */}
              <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${transaction.fraudScore * 100}%`,
                    backgroundColor:
                      transaction.fraudScore > 0.6
                        ? '#ef4444'
                        : transaction.fraudScore > 0.3
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
