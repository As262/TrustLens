import React, { useState } from "react";
import { AlertsSkeleton } from "../components/LoadingSkeletons";
import TransactionRow from "../components/TransactionRow";
import TransactionDetailModal from "../components/TransactionDetailModal";
import { useTransactions } from "../hooks/useTransactions";
import { useCardBlock } from "../contexts/CardBlockContext";

export default function Alerts({ user }) {
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [blockingTxn, setBlockingTxn] = useState(null);
  const { blockCard, unblockCard, isBlocked } = useCardBlock();

  const { transactions, loading, error, pagination } = useTransactions({
    userId: user?.id,
    page,
    limit: 20,
    isFlagged: true,
    withStats: false,
  });

  if (loading) {
    return <AlertsSkeleton />;
  }

  if (error) {
    return (
      <div
        className="rounded-lg border bg-white p-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          We could not load your alerts.
        </h2>
        <p
          className="text-sm mt-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Alerts
          </h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            Review flagged transactions for potential fraud.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div
          className="rounded-lg border bg-white p-10 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              color: "var(--color-primary)",
            }}
          >
            OK
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            All clear! No alerts.
          </h2>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Your account is in good standing.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border bg-white overflow-hidden"
          style={{ borderColor: "var(--color-border)" }}
        >
          <table className="w-full text-sm">
            <tbody>
              {transactions.map((txn) => {
                const txnId = txn._id || `${txn.timestamp}-${txn.amount}`;
                const blocked = isBlocked(txnId);
                return (
                  <TransactionRow
                    key={txnId}
                    transaction={txn}
                    onSelect={() => setSelectedTransaction(txn)}
                    isBlocked={blocked}
                    actionLabel={blocked ? "Unblock Card" : "Block Card"}
                    onAction={(txn) => {
                      if (blocked) {
                        unblockCard(txnId);
                      } else {
                        setBlockingTxn({ id: txnId, data: txn });
                      }
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Page {page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg border text-sm font-semibold disabled:opacity-50"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-primary)",
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-2 rounded-lg border text-sm font-semibold disabled:opacity-50"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-primary)",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {blockingTxn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setBlockingTxn(null)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-xl shadow-2xl border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: "var(--color-danger)" }}
            >
              Block Card?
            </h3>
            <p className="mb-6 opacity-90 leading-relaxed md:text-md text-sm">
              Are you sure you want to block your card due to this transaction
              at{" "}
              {blockingTxn.data.merchant ||
                (blockingTxn.data.category
                  ? `${blockingTxn.data.category.charAt(0).toUpperCase() + blockingTxn.data.category.slice(1)} Merchant`
                  : "Unknown Merchant")}
              ?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setBlockingTxn(null)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  color: "var(--color-text-muted)",
                  backgroundColor: "var(--color-surface-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  blockCard(blockingTxn.id, blockingTxn.data);
                  setBlockingTxn(null);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-white"
                style={{ backgroundColor: "var(--color-danger)" }}
              >
                Block Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
