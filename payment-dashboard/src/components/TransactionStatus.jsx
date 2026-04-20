import React from 'react';
import { CheckCircle, AlertOctagon, Clock } from 'lucide-react';

const TransactionStatus = ({ decision }) => {
  if (!decision) return null;

  const isApproved = decision === 'Approved';
  const isBlocked = decision === 'Blocked';
  const isReview = decision === 'Review';

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg 
      ${isApproved ? 'bg-emerald-500/10 border-emerald-500/30' : 
        isBlocked ? 'bg-red-500/10 border-red-500/30' : 
        'bg-amber-500/10 border-amber-500/30'}`}
    >
      {isApproved && <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />}
      {isBlocked && <AlertOctagon className="w-8 h-8 text-red-500 flex-shrink-0" />}
      {isReview && <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />}
      
      <div>
        <h4 className={`font-bold text-lg leading-tight uppercase tracking-wide
          ${isApproved ? 'text-emerald-400' : isBlocked ? 'text-red-400' : 'text-amber-400'}`}
        >
          Transaction {decision}
        </h4>
        <p className="text-slate-400 text-sm mt-0.5">
          {isApproved ? 'Your payment has been processed successfully.' :
           isBlocked ? 'This payment was flagged for security reasons.' :
           'Your transaction is currently pending security review.'}
        </p>
      </div>
    </div>
  );
};

export default TransactionStatus;
