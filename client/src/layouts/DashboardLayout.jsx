import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../store/authSlice';
import { clearAccount } from '../store/accountSlice';
import api from '../utils/api';
import Chatbot from '../components/Chatbot';
import {
    HiOutlineHome,
    HiOutlineBanknotes,
    HiOutlineArrowDownTray,
    HiOutlineArrowUpTray,
    HiOutlineArrowsRightLeft,
    HiOutlineClipboardDocumentList,
    HiOutlineUser,
    HiOutlineArrowRightOnRectangle,
    HiOutlineSun,
    HiOutlineMoon,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineBellAlert,
    HiOutlineSparkles,
    HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/deposit', label: 'Deposit', icon: HiOutlineArrowDownTray },
    { path: '/withdraw', label: 'Withdraw', icon: HiOutlineArrowUpTray },
    { path: '/transfer', label: 'Transfer', icon: HiOutlineArrowsRightLeft },
    { path: '/transactions', label: 'Transactions', icon: HiOutlineClipboardDocumentList },
    { path: '/ai-insights', label: 'AI Insights', icon: HiOutlineSparkles },
    { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const { isDark, toggleTheme } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (_) { /* ignore */ }
        dispatch(logout());
        dispatch(clearAccount());
        navigate('/login');
    };

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <div className="min-h-screen flex bg-dark-50 dark:bg-dark-950 gradient-mesh">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ─── Sidebar ─────────────────────────────────────────── */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-r border-dark-100/80 dark:border-dark-800/50 flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo Header */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <HiOutlineBanknotes className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-dark-900 dark:text-white tracking-tight block leading-none">
                            NexusBank
                        </span>
                        <span className="text-[10px] font-semibold text-primary-500 dark:text-primary-400 tracking-widest uppercase">
                            Premium
                        </span>
                    </div>
                    <button
                        className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <HiOutlineXMark className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
                    <div className="mb-3">
                        <p className="px-4 text-[10px] font-semibold text-dark-400 tracking-[0.15em] uppercase mb-2">Menu</p>
                    </div>
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                            }
                        >
                            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                            <span>{label}</span>
                            {label === 'AI Insights' && (
                                <span className="ml-auto text-[9px] font-bold bg-gradient-to-r from-primary-600 to-accent-500 text-white px-2 py-0.5 rounded-full">
                                    NEW
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Card + Logout */}
                <div className="p-4 space-y-3 border-t border-dark-100/80 dark:border-dark-800/50">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-50/80 dark:bg-dark-800/50">
                        <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100 truncate">{user?.fullName}</p>
                            <p className="text-[11px] text-dark-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/5 hover:text-danger-600"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-[18px] h-[18px]" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ─── Main Content ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 bg-white/70 dark:bg-dark-900/70 backdrop-blur-2xl border-b border-dark-100/60 dark:border-dark-800/40">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <HiOutlineBars3 className="w-5 h-5 text-dark-500 dark:text-dark-400" />
                            </button>

                            {/* Search bar (desktop) */}
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-all w-72">
                                <HiOutlineMagnifyingGlass className="w-4 h-4 text-dark-400" />
                                <span className="text-sm text-dark-400">Search...</span>
                                <kbd className="ml-auto text-[10px] font-mono font-medium text-dark-300 dark:text-dark-500 bg-white dark:bg-dark-700 px-1.5 py-0.5 rounded border border-dark-200 dark:border-dark-600">⌘K</kbd>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notification bell */}
                            <button className="p-2.5 rounded-xl hover:bg-dark-100/80 dark:hover:bg-dark-800/80 transition-colors relative">
                                <HiOutlineBellAlert className="w-5 h-5 text-dark-400" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-dark-900" />
                            </button>

                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl hover:bg-dark-100/80 dark:hover:bg-dark-800/80 transition-all duration-300"
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (
                                    <HiOutlineSun className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <HiOutlineMoon className="w-5 h-5 text-dark-400" />
                                )}
                            </button>

                            {/* Avatar */}
                            <div className="flex items-center gap-3 pl-3 ml-1 border-l border-dark-200/60 dark:border-dark-700/60">
                                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                    {initials}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-dark-800 dark:text-dark-100 leading-tight">
                                        {user?.fullName}
                                    </p>
                                    <p className="text-[11px] text-dark-400 leading-tight">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
                <Chatbot />
            </div>
        </div>
    );
}

export default DashboardLayout;
