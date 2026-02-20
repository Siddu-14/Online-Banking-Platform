import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineBanknotes } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FormField } from '../components/ui';

function Register() {
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            toast.success(data.message);
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                <h2 className="text-3xl font-bold text-dark-900 dark:text-white tracking-tight">Create Account</h2>
                <p className="text-dark-500 dark:text-dark-400 mt-2 text-sm">Join NexusBank and start banking smarter.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="Full Name" icon={HiOutlineUser}>
                    <input name="fullName" type="text" placeholder="John Doe" value={form.fullName} onChange={handleChange} required className="input-field pl-12" />
                </FormField>

                <FormField label="Email Address" icon={HiOutlineEnvelope}>
                    <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required className="input-field pl-12" />
                </FormField>

                <FormField label="Phone Number" icon={HiOutlinePhone}>
                    <input name="phone" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} required className="input-field pl-12" />
                </FormField>

                <FormField label="Password" icon={HiOutlineLockClosed} hint="Minimum 6 characters">
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
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
                    {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-dark-500 dark:text-dark-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 transition-colors">
                    Sign In →
                </Link>
            </p>
        </div>
    );
}

export default Register;
