import {
  ArrowLeftRight,
  Banknote,
  Zap,
  CreditCard,
  Film,
  ShoppingBag,
  Utensils,
} from "lucide-react";

/**
 * TransactionRow - Single row in transaction table
 */
export default function TransactionRow({
  transaction = {},
  onAction = () => {},
  onSelect = () => {},
  actionLabel = "Explain",
  isBlocked = false,
}) {
  const {
    amount = 0,
    merchant,
    category = "other",
    location,
    city,
    timestamp = new Date(),
    status = "completed",
    isFlagged = false,
    fraudScore = 0,
  } = transaction;

  const displayLocation = location || city || "Unknown";
  const displayMerchant =
    merchant ||
    `${category.charAt(0).toUpperCase() + category.slice(1)} Merchant`;

  const formatAmount = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amt);

  const formatTime = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatus = () => {
    if (isFlagged || status === "flagged") {
      return { label: "Flagged", color: "var(--color-danger)" };
    }
    if (fraudScore >= 0.6) {
      return { label: "Suspicious", color: "var(--color-warning)" };
    }
    return { label: "Normal", color: "var(--color-success)" };
  };

  const getCategoryIcon = () => {
    const icons = {
      shopping: <ShoppingBag className="w-4 h-4" />,
      dining: <Utensils className="w-4 h-4" />,
      utilities: <Zap className="w-4 h-4" />,
      entertainment: <Film className="w-4 h-4" />,
      transfer: <ArrowLeftRight className="w-4 h-4" />,
      withdrawal: <Banknote className="w-4 h-4" />,
    };
    return icons[category] || <CreditCard className="w-4 h-4" />;
  };

  const statusBadge = getStatus();

  return (
    <tr
      className="txn-row border-b cursor-pointer transition-colors"
      onClick={() => onSelect(transaction)}
      style={{ borderColor: "var(--color-border)" }}
    >
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span
            className="text-slate-500"
            style={{ color: "var(--color-text-muted)" }}
          >
            {getCategoryIcon()}
          </span>
          <div>
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              {displayMerchant}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
              {displayLocation}
            </p>
          </div>
        </div>
      </td>
      <td
        className="px-4 py-3 text-sm font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        {formatAmount(amount)}
      </td>
      <td
        className="px-4 py-3 text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        {formatTime(timestamp)}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className="px-2 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            color: statusBadge.color,
          }}
        >
          {statusBadge.label}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onAction(transaction);
          }}
          className="px-3 py-1 rounded-lg border text-xs font-semibold transition"
          style={
            isBlocked
              ? {
                  borderColor: "var(--color-success)",
                  color: "white",
                  backgroundColor: "var(--color-success)",
                  cursor: "pointer",
                }
              : {
                  borderColor:
                    actionLabel === "Block Card"
                      ? "var(--color-danger)"
                      : "var(--color-primary)",
                  color:
                    actionLabel === "Block Card"
                      ? "white"
                      : "var(--color-primary)",
                  backgroundColor:
                    actionLabel === "Block Card"
                      ? "var(--color-danger)"
                      : "transparent",
                  cursor: "pointer",
                }
          }
        >
          {actionLabel}
        </button>
      </td>
    </tr>
  );
}
