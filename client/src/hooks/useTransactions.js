import { useState, useEffect } from 'react';
import { transactionAPI } from '../utils/api';

/**
 * Custom hook for transaction data fetching
 */
export const useTransactions = ({ page = 1, limit = 10, userId, withStats = true, isFlagged } = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page,
    limit,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchTransactions();

    const handleUpdate = () => {
      fetchTransactions();
    };

    window.addEventListener('transactionsUpdated', handleUpdate);
    return () => window.removeEventListener('transactionsUpdated', handleUpdate);
  }, [page, limit, userId, withStats, isFlagged]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [transactionAPI.getTransactions({ userId, page, limit, isFlagged })];
      if (withStats && userId) {
        requests.push(transactionAPI.getStats({ userId }));
      }

      const [txnData, statsData] = await Promise.all(requests);
      const txnPayload = txnData?.data || txnData;
      const statsPayload = statsData?.data || statsData;

      const total = txnPayload?.pagination?.total ?? txnPayload?.total ?? 0;
      const pages = txnPayload?.pagination?.pages ?? (limit ? Math.ceil(total / limit) : 0);
      const currentPage = txnPayload?.pagination?.page ?? page;

      setTransactions(txnPayload?.transactions || []);
      setPagination({
        page: currentPage,
        limit,
        total,
        pages,
      });
      if (withStats) {
        setStats(statsPayload || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    stats,
    loading,
    error,
    pagination,
    refetch: fetchTransactions,
  };
};

export default useTransactions;
