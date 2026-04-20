import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-xs mb-1">{label}</p>
        <p className="text-primary font-bold">
          Score: <span className="text-white">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const TrustScoreChart = ({ history }) => {
  if (!history || history.length < 2) {
    return (
      <div className="glass-card p-6 h-64 flex items-center justify-center text-slate-500 text-sm">
        Need more transactions to display chart
      </div>
    );
  }

  // Format data for chart (oldest first)
  const chartData = [...history].reverse().map((txn, index) => ({
    name: `Txn ${index + 1}`,
    score: txn.score,
  }));

  return (
    <div className="glass-card p-6 h-64 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 h-6">Score Trend</h3>
      <div className="flex-1 w-full relative -left-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{fill: '#64748b', fontSize: 12}} 
              stroke="#475569" 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{fill: '#64748b', fontSize: 12}} 
              stroke="#475569"
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#1E293B', stroke: '#3B82F6', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrustScoreChart;
