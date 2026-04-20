import React from 'react';
import { Activity, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

const TrustScoreCard = ({ score, riskLevel }) => {
  // Determine colors based on risk level
  const isHighRisk = riskLevel === 'High';
  const isMediumRisk = riskLevel === 'Medium';
  const isLowRisk = riskLevel === 'Low';

  let colors = "from-emerald-400 to-emerald-600 shadow-emerald-500/20";
  let icon = <ShieldCheck className="w-10 h-10 text-emerald-400" />;
  let textColor = "text-emerald-400";
  let bgGradient = "from-emerald-500/10 to-transparent";

  if (isHighRisk) {
    colors = "from-red-500 to-rose-600 shadow-red-500/20";
    icon = <ShieldAlert className="w-10 h-10 text-red-500" />;
    textColor = "text-red-500";
    bgGradient = "from-red-500/10 to-transparent";
  } else if (isMediumRisk) {
    colors = "from-amber-400 to-orange-500 shadow-orange-500/20";
    icon = <ShieldAlert className="w-10 h-10 text-amber-500" />;
    textColor = "text-amber-500";
    bgGradient = "from-amber-500/10 to-transparent";
  } else if (!riskLevel) {
    colors = "from-blue-400 to-indigo-500 shadow-blue-500/20";
    icon = <Shield className="w-10 h-10 text-blue-400" />;
    textColor = "text-blue-400";
    bgGradient = "from-blue-500/10 to-transparent";
  }

  return (
    <div className={`glass-card p-6 relative overflow-hidden bg-gradient-to-br ${bgGradient}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Activity className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-4 p-4 rounded-full bg-white/5 border border-white/10 shadow-lg inline-flex">
          {icon}
        </div>
        
        <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-1">
          Trust Score
        </h3>
        
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colors}`}>
            {score !== undefined ? score : '--'}
          </span>
          <span className="text-xl text-slate-500 font-medium">/100</span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isHighRisk ? '#EF4444' : isMediumRisk ? '#F59E0B' : isLowRisk ? '#10B981' : '#3B82F6' }}></span>
          <span className={`font-semibold tracking-wide ${textColor}`}>
            {riskLevel ? `${riskLevel} Risk` : 'Analyzing'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCard;
