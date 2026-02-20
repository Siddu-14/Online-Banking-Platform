import { Outlet } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineBanknotes } from 'react-icons/hi2';

function AuthLayout() {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Premium Gradient */}
            <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden noise-overlay">
                {/* Animated background orbs */}
                <div className="absolute inset-0">
                    <div className="absolute top-[15%] left-[10%] w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-accent-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[60%] left-[40%] w-64 h-64 bg-primary-400/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '64px 64px',
                        }}
                    />
                </div>

                <div className="relative z-10 flex flex-col justify-between py-12 px-16 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                            <HiOutlineBanknotes className="w-6 h-6 text-primary-300" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">NexusBank</span>
                    </div>

                    {/* Hero Content */}
                    <div className="animate-fade-in">
                        <h1 className="text-5xl font-extrabold text-white leading-[1.15] mb-6 tracking-tight">
                            Banking Made
                            <br />
                            <span className="text-gradient-warm">Intelligent</span>
                        </h1>

                        <p className="text-lg text-primary-200/70 leading-relaxed max-w-md mb-12">
                            AI-powered insights, real-time fraud detection, and seamless transfers — all in one platform.
                        </p>

                        <div className="flex items-center gap-8">
                            {[
                                { value: '256-bit', label: 'Encryption' },
                                { value: 'AI', label: 'Powered' },
                                { value: '99.9%', label: 'Uptime' },
                            ].map(({ value, label }, i) => (
                                <div key={i} className={`${i > 0 ? 'border-l border-white/10 pl-8' : ''}`}>
                                    <div className="text-2xl font-bold text-white">{value}</div>
                                    <div className="text-xs text-primary-300/60 font-medium tracking-wide uppercase mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-xs text-primary-300/40">
                        <HiOutlineShieldCheck className="w-4 h-4" />
                        <span>Secured by enterprise-grade encryption</span>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-dark-950 gradient-mesh">
                <div className="w-full max-w-md animate-fade-in">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
