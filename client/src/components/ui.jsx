/**
 * Reusable UI component library for NexusBank.
 * Clean, composable, Stripe/Revolut-inspired components.
 */

/* ─── PageHeader ─────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, icon: Icon, action, badge }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        {title}
                        {badge && <span className="badge-primary text-xs">{badge}</span>}
                    </h1>
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

/* ─── StatCard ───────────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, color = 'primary', trend, className = '' }) {
    const colorMap = {
        primary: {
            bg: 'bg-primary-50 dark:bg-primary-500/10',
            text: 'text-primary-600 dark:text-primary-400',
            icon: 'text-primary-600 dark:text-primary-400',
        },
        success: {
            bg: 'bg-success-50 dark:bg-success-500/10',
            text: 'text-success-600 dark:text-success-400',
            icon: 'text-success-600 dark:text-success-400',
        },
        danger: {
            bg: 'bg-danger-50 dark:bg-danger-500/10',
            text: 'text-danger-500',
            icon: 'text-danger-500',
        },
        warning: {
            bg: 'bg-warning-50 dark:bg-warning-500/10',
            text: 'text-warning-600 dark:text-warning-400',
            icon: 'text-warning-600 dark:text-warning-400',
        },
    };

    const c = colorMap[color] || colorMap.primary;

    return (
        <div className={`stat-card group ${className}`}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{label}</p>
                    <p className={`text-2xl font-bold tracking-tight animate-count-up ${c.text}`}>{value}</p>
                    {trend && (
                        <p className={`text-xs font-semibold ${trend.positive ? 'text-success-600' : 'text-danger-500'}`}>
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`stat-icon ${c.bg}`}>
                        <Icon className={`w-6 h-6 ${c.icon}`} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── FormField ──────────────────────────────────────────────────── */
export function FormField({ label, icon: Icon, children, error, hint }) {
    return (
        <div className="space-y-2">
            {label && <label className="input-label">{label}</label>}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none z-10" />
                )}
                {children}
            </div>
            {error && <p className="text-xs text-danger-500 font-medium">{error}</p>}
            {hint && <p className="text-xs text-dark-400">{hint}</p>}
        </div>
    );
}

/* ─── Card ───────────────────────────────────────────────────────── */
export function Card({ children, className = '', hover = false, padding = 'p-6', ...props }) {
    return (
        <div
            className={`${hover ? 'glass-card-hover' : 'glass-card'} ${padding} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

/* ─── SectionTitle ───────────────────────────────────────────────── */
export function SectionTitle({ children, action, className = '' }) {
    return (
        <div className={`flex items-center justify-between mb-5 ${className}`}>
            <h3 className="text-lg font-semibold text-dark-800 dark:text-dark-100 tracking-tight">
                {children}
            </h3>
            {action}
        </div>
    );
}

/* ─── EmptyState ─────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-5">
                    <Icon className="w-8 h-8 text-dark-300 dark:text-dark-600" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300 mb-2">{title}</h3>
            <p className="text-sm text-dark-400 max-w-sm">{message}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

/* ─── SuccessMessage ─────────────────────────────────────────────── */
export function SuccessMessage({ title, children, onDismiss, dismissText = 'Make another' }) {
    return (
        <div className="glass-card p-6 border-success-200 dark:border-success-500/20 animate-scale-in bg-success-50/30 dark:bg-success-500/5">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-success-700 dark:text-success-400">{title}</h3>
            </div>
            <div className="text-dark-600 dark:text-dark-300 text-sm leading-relaxed">{children}</div>
            {onDismiss && (
                <button onClick={onDismiss} className="mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                    {dismissText} →
                </button>
            )}
        </div>
    );
}

/* ─── QuickAmountGrid ────────────────────────────────────────────── */
export function QuickAmountGrid({ amounts, selected, onSelect }) {
    return (
        <div className="grid grid-cols-3 gap-2.5">
            {amounts.map((amt) => (
                <button
                    key={amt}
                    type="button"
                    onClick={() => onSelect(amt.toString())}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${selected === amt.toString()
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                        : 'bg-dark-100/80 dark:bg-dark-800/80 text-dark-600 dark:text-dark-300 hover:bg-dark-200/80 dark:hover:bg-dark-700/80 hover:scale-[1.02]'
                        }`}
                >
                    ₹{amt.toLocaleString()}
                </button>
            ))}
        </div>
    );
}
