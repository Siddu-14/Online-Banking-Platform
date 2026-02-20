import { useState, useEffect } from 'react';
import {
    HiOutlineSparkles,
    HiOutlineShieldCheck,
    HiOutlineChartBar,
    HiOutlineExclamationTriangle,
    HiOutlineLightBulb,
    HiOutlineCpuChip,
} from 'react-icons/hi2';
import {
    PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, StatCard, Card, SectionTitle, EmptyState } from '../components/ui';

function AIInsights() {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        async function fetchInsights() {
            try {
                const { data } = await api.get('/ai/insights');
                setInsights(data);
            } catch (err) {
                console.error('Fetch AI insights error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchInsights();
    }, []);

    const formatCurrency = (amt) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" text="AI is analyzing your data..." />
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="space-y-8">
                <PageHeader title="AI Insights" subtitle="Powered by NexusBank AI Engine" icon={HiOutlineSparkles} badge="BETA" />
                <EmptyState icon={HiOutlineCpuChip} title="No data available" message="Make some transactions to unlock AI insights!" />
            </div>
        );
    }

    const { categorization, fraudAnalysis, predictions } = insights;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiOutlineSparkles },
        { id: 'categories', label: 'Categories', icon: HiOutlineChartBar },
        { id: 'fraud', label: 'Fraud Alerts', icon: HiOutlineShieldCheck },
        { id: 'predictions', label: 'Predictions', icon: HiOutlineLightBulb },
    ];

    const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#14b8a6', '#06b6d4', '#f97316'];

    const chartTooltipStyle = {
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '12px',
        color: '#f1f5f9',
        fontSize: '13px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
    };

    return (
        <div className="space-y-6 stagger-children">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="AI Insights" subtitle="Powered by NexusBank AI Engine" icon={HiOutlineSparkles} badge="BETA" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-500/10 border border-success-200/50 dark:border-success-500/20">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-soft" />
                    <span className="text-xs font-semibold text-success-700 dark:text-success-400">AI Engine Active</span>
                </div>
            </div>

            {/* Tab Navigation */}
            <Card padding="p-1.5" className="flex gap-1 overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === id
                                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/20'
                                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800/60'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </Card>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6 stagger-children">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Categories" value={categorization?.distribution?.length || 0} icon={HiOutlineChartBar} color="primary" />
                        <StatCard label="Fraud Alerts" value={fraudAnalysis?.flaggedCount || 0} icon={HiOutlineExclamationTriangle} color="danger" />
                        <StatCard label="Trend" value={predictions?.predictions?.trend || 'N/A'} icon={HiOutlineLightBulb} color="success" />
                        <StatCard label="Analyzed" value={categorization?.totalCategorized || 0} icon={HiOutlineCpuChip} color="primary" />
                    </div>

                    {/* Recommendations */}
                    {predictions?.predictions?.recommendations?.length > 0 && (
                        <Card>
                            <SectionTitle>
                                <span className="flex items-center gap-2">
                                    <HiOutlineLightBulb className="w-5 h-5 text-warning-500" />
                                    AI Recommendations
                                </span>
                            </SectionTitle>
                            <div className="space-y-3 mt-4">
                                {predictions.predictions.recommendations.map((rec, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 p-4 rounded-xl ${rec.type === 'alert'
                                                ? 'bg-danger-50/80 dark:bg-danger-500/5 border border-danger-200/50 dark:border-danger-500/20'
                                                : rec.type === 'warning'
                                                    ? 'bg-warning-50/80 dark:bg-warning-500/5 border border-warning-200/50 dark:border-warning-500/20'
                                                    : 'bg-success-50/80 dark:bg-success-500/5 border border-success-200/50 dark:border-success-500/20'
                                            }`}
                                    >
                                        <span className="text-xl flex-shrink-0">{rec.icon}</span>
                                        <p className="text-sm text-dark-700 dark:text-dark-200 leading-relaxed">{rec.message}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <SectionTitle>Spending Distribution</SectionTitle>
                        {categorization?.distribution?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categorization.distribution}
                                        dataKey="total"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={110}
                                        paddingAngle={3}
                                        label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {categorization.distribution.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color || PIE_COLORS[idx % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={chartTooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState icon={HiOutlineChartBar} title="No data" message="No category data available yet." />
                        )}
                    </Card>

                    <Card>
                        <SectionTitle>Category Breakdown</SectionTitle>
                        <div className="space-y-2 mt-4">
                            {categorization?.distribution?.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-dark-50/60 dark:bg-dark-800/40 hover:bg-dark-100/60 dark:hover:bg-dark-800/60 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl transition-transform group-hover:scale-110">{cat.icon}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">{cat.category}</p>
                                            <p className="text-xs text-dark-400">{cat.count} transaction{cat.count !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-dark-900 dark:text-white tabular-nums">{formatCurrency(cat.total)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* FRAUD TAB */}
            {activeTab === 'fraud' && (
                <div className="space-y-6">
                    {/* Risk Assessment */}
                    <Card>
                        <div className="flex items-center justify-between mb-5">
                            <SectionTitle>Account Risk Assessment</SectionTitle>
                            <span className={`badge ${fraudAnalysis?.overallRisk === 'low' ? 'badge-success'
                                    : fraudAnalysis?.overallRisk === 'medium' ? 'badge-warning'
                                        : 'badge-danger'
                                } uppercase`}>
                                {fraudAnalysis?.overallRisk || 'N/A'} risk
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 h-3 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${(fraudAnalysis?.overallScore || 0) < 30 ? 'bg-success-500'
                                            : (fraudAnalysis?.overallScore || 0) < 60 ? 'bg-warning-500'
                                                : 'bg-danger-500'
                                        }`}
                                    style={{ width: `${fraudAnalysis?.overallScore || 0}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-dark-700 dark:text-dark-200 tabular-nums">{fraudAnalysis?.overallScore || 0}/100</span>
                        </div>
                        <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">{fraudAnalysis?.summary}</p>
                    </Card>

                    {/* Flagged Transactions */}
                    {fraudAnalysis?.flaggedTransactions?.length > 0 ? (
                        <Card>
                            <SectionTitle>
                                <span className="flex items-center gap-2">
                                    ⚠️ Flagged Transactions
                                    <span className="badge-warning">{fraudAnalysis.flaggedCount}</span>
                                </span>
                            </SectionTitle>
                            <div className="space-y-4 mt-4">
                                {fraudAnalysis.flaggedTransactions.map((txn, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-warning-200/60 dark:border-warning-500/20 bg-warning-50/50 dark:bg-warning-500/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-dark-800 dark:text-dark-100">Risk Score: {txn.riskScore}/100</span>
                                            <span className={`badge uppercase ${txn.riskLevel === 'low' ? 'badge-success'
                                                    : txn.riskLevel === 'medium' ? 'badge-warning'
                                                        : 'badge-danger'
                                                }`}>
                                                {txn.riskLevel}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {txn.alerts.map((alert, j) => (
                                                <div key={j} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-300">
                                                    <span className="flex-shrink-0">{alert.icon}</span>
                                                    <span>{alert.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-dark-400 mt-3 italic">{txn.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card padding="p-12" className="text-center">
                            <HiOutlineShieldCheck className="w-16 h-16 mx-auto text-success-500 mb-4" />
                            <p className="text-lg font-semibold text-dark-800 dark:text-dark-100">All Clear!</p>
                            <p className="text-dark-400 mt-1 text-sm">No suspicious transactions detected.</p>
                        </Card>
                    )}
                </div>
            )}

            {/* PREDICTIONS TAB */}
            {activeTab === 'predictions' && (
                <div className="space-y-6">
                    {predictions?.hasEnoughData ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Projected Spend" value={formatCurrency(predictions.predictions.projectedMonthlySpend)} icon={HiOutlineChartBar} color="primary" />
                                <StatCard
                                    label="Projected Savings"
                                    value={formatCurrency(predictions.predictions.projectedMonthlySavings)}
                                    icon={HiOutlineLightBulb}
                                    color={predictions.predictions.projectedMonthlySavings >= 0 ? 'success' : 'danger'}
                                />
                                <StatCard label="Avg Daily Expense" value={formatCurrency(predictions.predictions.avgDailyExpense)} icon={HiOutlineChartBar} color="primary" />
                                <StatCard label="Model Confidence" value={`${((predictions.model.rSquared || 0) * 100).toFixed(0)}%`} icon={HiOutlineCpuChip} color="primary" />
                            </div>

                            {/* Projection Chart */}
                            {predictions.predictions.futureProjection?.length > 0 && (
                                <Card>
                                    <SectionTitle>30-Day Spending Forecast</SectionTitle>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={predictions.predictions.futureProjection}>
                                            <defs>
                                                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={chartTooltipStyle} />
                                            <Area type="monotone" dataKey="projectedExpense" stroke="#6366f1" fill="url(#predGrad)" strokeWidth={2.5} dot={false} name="Projected" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon={HiOutlineChartBar}
                            title="Not Enough Data"
                            message={predictions?.message || 'Make more transactions to unlock predictions.'}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default AIInsights;
