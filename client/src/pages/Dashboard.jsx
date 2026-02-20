import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setAccount, setTransactions, setStats } from '../store/accountSlice';
import {
    HiOutlineBanknotes,
    HiOutlineArrowTrendingUp,
    HiOutlineArrowTrendingDown,
    HiOutlineArrowsRightLeft,
    HiOutlineArrowDownTray,
    HiOutlineArrowUpTray,
    HiOutlineSparkles,
} from 'react-icons/hi2';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, StatCard, Card, SectionTitle, EmptyState } from '../components/ui';

function Dashboard() {
    const dispatch = useDispatch();
    const { account, transactions, stats, chartData } = useSelector((s) => s.account);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [accRes, txnRes, statsRes] = await Promise.all([
                    api.get('/account/me'),
                    api.get('/transactions?limit=5'),
                    api.get('/transactions/stats'),
                ]);
                dispatch(setAccount(accRes.data.account));
                dispatch(setTransactions(txnRes.data.transactions));
                dispatch(setStats({ stats: statsRes.data.stats, chartData: statsRes.data.chartData }));
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

    const quickActions = [
        { to: '/deposit', label: 'Deposit', icon: HiOutlineArrowDownTray },
        { to: '/withdraw', label: 'Withdraw', icon: HiOutlineArrowUpTray },
        { to: '/transfer', label: 'Transfer', icon: HiOutlineArrowsRightLeft },
        { to: '/ai-insights', label: 'AI Insights', icon: HiOutlineSparkles },
    ];

    return (
        <div className="space-y-8 stagger-children">
            <PageHeader
                title="Dashboard"
                subtitle="Your financial overview at a glance"
            />

            {/* ─── Balance Hero Card ────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-8 lg:p-10">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
                    {/* Decorative orbs */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/[0.03] rounded-full translate-y-1/3 -translate-x-1/4" />
                    <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-accent-400/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse-soft" />
                            <p className="text-primary-200/80 text-sm font-medium tracking-wide">Total Balance</p>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight animate-count-up">
                            {formatCurrency(account?.balance)}
                        </h2>
                        <p className="text-primary-300/70 text-sm font-mono tracking-wider">
                            {account?.accountNumber}
                        </p>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2.5 mt-8">
                            {quickActions.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.16] rounded-xl text-sm font-semibold text-white/90 backdrop-blur-sm border border-white/[0.06] transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Icon className="w-4 h-4" /> {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary stats */}
                <div className="space-y-4 stagger-children">
                    <StatCard
                        label="Total Income"
                        value={formatCurrency(stats?.totalIncome)}
                        icon={HiOutlineArrowTrendingUp}
                        color="success"
                    />
                    <StatCard
                        label="Total Expense"
                        value={formatCurrency(stats?.totalExpense)}
                        icon={HiOutlineArrowTrendingDown}
                        color="danger"
                    />
                    <StatCard
                        label="Transfers Out"
                        value={formatCurrency(stats?.totalTransfersOut)}
                        icon={HiOutlineArrowsRightLeft}
                        color="primary"
                    />
                </div>
            </div>

            {/* ─── Chart + Recent Transactions ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Chart */}
                <Card>
                    <SectionTitle>Spending Overview</SectionTitle>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(148, 163, 184, 0.1)',
                                        borderRadius: '12px',
                                        color: '#f1f5f9',
                                        fontSize: '13px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2.5} dot={false} />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2.5} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState
                            icon={HiOutlineBanknotes}
                            title="No data yet"
                            message="Make a deposit to start tracking your finances."
                            action={<Link to="/deposit" className="btn-primary text-sm px-5 py-2.5">Make Deposit</Link>}
                        />
                    )}
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <SectionTitle
                        action={
                            <Link to="/transactions" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 transition-colors">
                                View All →
                            </Link>
                        }
                    >
                        Recent Transactions
                    </SectionTitle>

                    {transactions.length > 0 ? (
                        <div className="space-y-2">
                            {transactions.map((txn) => (
                                <div
                                    key={txn.id}
                                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-dark-50/80 dark:hover:bg-dark-800/40 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${txn.category === 'credit'
                                                    ? 'bg-success-50 dark:bg-success-500/10'
                                                    : 'bg-danger-50 dark:bg-danger-500/10'
                                                }`}
                                        >
                                            {txn.type === 'DEPOSIT' && <HiOutlineArrowDownTray className="w-5 h-5 text-success-600 dark:text-success-400" />}
                                            {txn.type === 'WITHDRAW' && <HiOutlineArrowUpTray className="w-5 h-5 text-danger-500" />}
                                            {txn.type === 'TRANSFER' && <HiOutlineArrowsRightLeft className={`w-5 h-5 ${txn.category === 'credit' ? 'text-success-600' : 'text-danger-500'}`} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">
                                                {txn.description || txn.type}
                                            </p>
                                            <p className="text-xs text-dark-400 mt-0.5">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold tabular-nums ${txn.category === 'credit' ? 'text-success-600 dark:text-success-400' : 'text-danger-500'
                                        }`}>
                                        {txn.category === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={HiOutlineClipboardDocumentList}
                            title="No transactions"
                            message="Your transaction history will appear here."
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
