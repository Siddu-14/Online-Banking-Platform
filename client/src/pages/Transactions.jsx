import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTransactions } from '../store/accountSlice';
import {
    HiOutlineArrowDownTray,
    HiOutlineArrowUpTray,
    HiOutlineArrowsRightLeft,
    HiOutlineFunnel,
    HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, Card, EmptyState } from '../components/ui';

function Transactions() {
    const dispatch = useDispatch();
    const { transactions } = useSelector((s) => s.account);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchTransactions = async (p = 1, type = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 10 });
            if (type) params.append('type', type);
            const { data } = await api.get(`/transactions?${params}`);
            dispatch(setTransactions(data.transactions));
            setPagination(data.pagination);
        } catch (err) {
            console.error('Fetch transactions error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page, filter);
    }, [page, filter]);

    const formatCurrency = (amt) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

    const typeIcon = (type, category) => {
        const isCredit = category === 'credit';
        const colorClass = isCredit ? 'text-success-600 dark:text-success-400' : 'text-danger-500';
        const bgClass = isCredit ? 'bg-success-50 dark:bg-success-500/10' : 'bg-danger-50 dark:bg-danger-500/10';

        return (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${bgClass}`}>
                {type === 'DEPOSIT' && <HiOutlineArrowDownTray className={`w-5 h-5 ${colorClass}`} />}
                {type === 'WITHDRAW' && <HiOutlineArrowUpTray className={`w-5 h-5 ${colorClass}`} />}
                {type === 'TRANSFER' && <HiOutlineArrowsRightLeft className={`w-5 h-5 ${colorClass}`} />}
            </div>
        );
    };

    const filters = [
        { value: '', label: 'All' },
        { value: 'DEPOSIT', label: 'Deposits' },
        { value: 'WITHDRAW', label: 'Withdrawals' },
        { value: 'TRANSFER', label: 'Transfers' },
    ];

    return (
        <div className="space-y-6 stagger-children">
            <PageHeader
                title="Transactions"
                subtitle="View and filter your transaction history"
                icon={HiOutlineClipboardDocumentList}
                badge={pagination ? `${pagination.total} total` : null}
            />

            {/* Filters */}
            <Card padding="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-dark-400">
                        <HiOutlineFunnel className="w-4 h-4" />
                        <span className="text-xs font-semibold tracking-wide uppercase">Filter</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filters.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => { setFilter(value); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${filter === value
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                        : 'bg-dark-100/80 dark:bg-dark-800/80 text-dark-600 dark:text-dark-300 hover:bg-dark-200/80 dark:hover:bg-dark-700/80'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Transactions List */}
            <Card padding="p-0" className="overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner size="lg" text="Loading transactions..." />
                    </div>
                ) : transactions.length === 0 ? (
                    <EmptyState
                        icon={HiOutlineClipboardDocumentList}
                        title="No transactions found"
                        message="Make a deposit to get started!"
                    />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-100/80 dark:border-dark-800/60">
                                        {['Type', 'Description', 'Date', 'Status', 'Amount'].map((h, i) => (
                                            <th key={h} className={`p-4 text-xs font-semibold text-dark-400 tracking-wide uppercase ${i === 4 ? 'text-right' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn.id} className="border-b border-dark-50/80 dark:border-dark-800/30 hover:bg-dark-50/50 dark:hover:bg-dark-800/20 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {typeIcon(txn.type, txn.category)}
                                                    <span className="text-sm font-semibold text-dark-800 dark:text-dark-100 capitalize">
                                                        {txn.type.toLowerCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-dark-600 dark:text-dark-300">{txn.description || '—'}</td>
                                            <td className="p-4 text-sm text-dark-400 tabular-nums">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <span className="badge-success">{txn.status}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`text-sm font-bold tabular-nums ${txn.category === 'credit' ? 'text-success-600 dark:text-success-400' : 'text-danger-500'}`}>
                                                    {txn.category === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List */}
                        <div className="md:hidden divide-y divide-dark-100/80 dark:divide-dark-800/40">
                            {transactions.map((txn) => (
                                <div key={txn.id} className="p-4 flex items-center justify-between group hover:bg-dark-50/50 dark:hover:bg-dark-800/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {typeIcon(txn.type, txn.category)}
                                        <div>
                                            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">{txn.description || txn.type}</p>
                                            <p className="text-xs text-dark-400 mt-0.5">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold tabular-nums ${txn.category === 'credit' ? 'text-success-600 dark:text-success-400' : 'text-danger-500'}`}>
                                        {txn.category === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-dark-100/80 dark:border-dark-800/40">
                                <p className="text-xs font-medium text-dark-400">
                                    Page {pagination.page} of {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-ghost text-sm disabled:opacity-40"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        className="btn-ghost text-sm disabled:opacity-40"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}

export default Transactions;
