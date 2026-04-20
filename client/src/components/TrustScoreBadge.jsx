/**
 * TrustScoreBadge - Circular trust score display
 * Shows score 0-100 with color coding and label
 */
export default function TrustScoreBadge({ score = 60, size = 'md' }) {
  const getTrustColor = () => {
    if (score >= 75) return { bg: 'rgba(22, 163, 74, 0.12)', text: '#16A34A' };
    if (score >= 50) return { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706' };
    return { bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626' };
  };

  const getTrustLabel = () => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Fair';
    return 'At Risk';
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizes = {
    sm: 'text-lg font-bold',
    md: 'text-4xl font-bold',
    lg: 'text-6xl font-bold',
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const colors = getTrustColor();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex flex-col items-center justify-center border`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.text,
      }}
    >
      <div className={textSizes[size]}>{score}</div>
      <div className={`${labelSizes[size]} font-medium opacity-80`}>
        {getTrustLabel()}
      </div>
    </div>
  );
}
