import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOtpEmail } from '../store/authSlice';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineBanknotes } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FormField } from '../components/ui';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            if (data.requiresOtp) {
                dispatch(setOtpEmail(data.email));
                toast.success('OTP sent! Check console (simulated).');
                navigate('/verify-otp');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2.5">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <HiOutlineBanknotes className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-dark-900 dark:text-white tracking-tight">NexusBank</span>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-dark-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-dark-500 dark:text-dark-400 mt-2 text-sm">Enter your credentials to access your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="Email Address" icon={HiOutlineEnvelope}>
                    <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="input-field pl-12"
                    />
                </FormField>

                <FormField label="Password" icon={HiOutlineLockClosed}>
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="input-field pl-12 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors z-10"
                    >
                        {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                    </button>
                </FormField>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                    {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                </button>
            </form>

            <div className="p-4 rounded-xl bg-primary-50/80 dark:bg-primary-900/15 border border-primary-100/80 dark:border-primary-800/20">
                <p className="text-xs text-primary-700 dark:text-primary-300/80 text-center font-medium">
                    🔐 OTP code is <code className="font-mono font-bold bg-primary-100 dark:bg-primary-800/30 px-1.5 py-0.5 rounded">123456</code> (simulated for demo)
                </p>
            </div>

            <p className="text-center text-sm text-dark-500 dark:text-dark-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 transition-colors">
                    Create Account →
                </Link>
            </p>
        </div>
    );
}

export default Login;
