import React from 'react';

const TransactionTable = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-500">
        No transaction history available.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="font-semibold text-lg text-white">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Txn ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Score</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((txn, index) => (
              <tr key={txn.transactionId || index} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                  {txn.transactionId}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {new Date(txn.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  ${parseFloat(txn.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${txn.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 
                      txn.score >= 50 ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-red-500/20 text-red-400'}`}
                  >
                    {txn.score}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border
                    ${txn.decision === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                      txn.decision === 'Blocked' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                      'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}
                  >
                    {txn.decision}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
