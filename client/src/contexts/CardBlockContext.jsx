import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const CardBlockContext = createContext(null);

const STORAGE_KEY = "trustlens_blocked_cards";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ids: new Set(), transactions: [], blocked: false };
    const parsed = JSON.parse(raw);
    return {
      ids: new Set(parsed.ids || []),
      transactions: parsed.transactions || [],
      blocked: parsed.blocked || false,
    };
  } catch {
    return { ids: new Set(), transactions: [], blocked: false };
  }
}

function saveToStorage(ids, transactions, blocked) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ids: [...ids], transactions, blocked }),
    );
  } catch {
    // storage unavailable — silently ignore
  }
}

export function CardBlockProvider({ children }) {
  const initial = loadFromStorage();

  // Set of transaction IDs whose cards have been blocked
  const [blockedCardIds, setBlockedCardIds] = useState(initial.ids);
  // Log of blocked transactions
  const [blockedTransactions, setBlockedTransactions] = useState(
    initial.transactions,
  );
  // True once ANY card is blocked (disables future payments globally)
  const [isCardBlocked, setIsCardBlocked] = useState(initial.blocked);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(blockedCardIds, blockedTransactions, isCardBlocked);
  }, [blockedCardIds, blockedTransactions, isCardBlocked]);

  const blockCard = useCallback((txnId, txnDetails) => {
    setBlockedCardIds((prev) => {
      const next = new Set([...prev, txnId]);
      return next;
    });
    setIsCardBlocked(true);
    setBlockedTransactions((prev) => [
      {
        id: txnId,
        merchant:
          txnDetails?.merchant || txnDetails?.category || "Unknown Merchant",
        amount: txnDetails?.amount || 0,
        location: txnDetails?.location || txnDetails?.city || "Unknown",
        timestamp: new Date().toISOString(),
        reason: "Card Blocked",
        status: "blocked",
      },
      ...prev,
    ]);
  }, []);

  const isBlocked = useCallback(
    (txnId) => blockedCardIds.has(txnId),
    [blockedCardIds],
  );

  const unblockCard = useCallback((txnId) => {
    setBlockedCardIds((prev) => {
      const next = new Set(prev);
      next.delete(txnId);
      if (next.size === 0) {
        setIsCardBlocked(false);
      }
      return next;
    });
    setBlockedTransactions((prev) => prev.filter((t) => t.id !== txnId));
  }, []);

  return (
    <CardBlockContext.Provider
      value={{
        blockedCardIds,
        blockedTransactions,
        isCardBlocked,
        blockCard,
        unblockCard,
        isBlocked,
      }}
    >
      {children}
    </CardBlockContext.Provider>
  );
}

export function useCardBlock() {
  const ctx = useContext(CardBlockContext);
  if (!ctx)
    throw new Error("useCardBlock must be used inside CardBlockProvider");
  return ctx;
}
