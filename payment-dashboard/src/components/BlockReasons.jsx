import React from 'react';
import { AlertCircle } from 'lucide-react';

const BlockReasons = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="bg-slate-800/80 border border-red-500/30 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <h4 className="font-semibold text-red-200">Security Flags</h4>
      </div>
      <ul className="space-y-2">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-red-300">
            <span className="text-red-500 mt-1">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlockReasons;
