import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, setOtpEmail } from '../store/authSlice';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function VerifyOtp() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const { otpEmail } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!otpEmail) navigate('/login');
        inputRefs.current[0]?.focus();
    }, [otpEmail, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0)
            inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pasted)) {
            const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
            setOtp(newOtp);
            inputRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) { toast.error('Please enter 6-digit OTP'); return; }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email: otpEmail, otp: otpCode });
            dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
            dispatch(setOtpEmail(null));
            toast.success('Welcome to NexusBank!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'OTP verification failed');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center space-y-8">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25">
                <HiOutlineShieldCheck className="w-8 h-8 text-white" />
            </div>

            <div>
                <h2 className="text-3xl font-bold text-dark-900 dark:text-white tracking-tight">Verify Your Identity</h2>
                <p className="text-dark-500 dark:text-dark-400 mt-2 text-sm">
                    Enter the 6-digit code sent to
                    <br />
                    <span className="font-semibold text-dark-700 dark:text-dark-200">{otpEmail}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputRefs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 bg-white dark:bg-dark-800/80 text-dark-900 dark:text-white outline-none ${digit
                                    ? 'border-primary-500 shadow-md shadow-primary-500/10'
                                    : 'border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600'
                                } focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
                        />
                    ))}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                    {loading ? <LoadingSpinner size="sm" /> : 'Verify & Login'}
                </button>
            </form>

            <p className="text-sm text-dark-400">
                Hint: OTP is <code className="font-mono font-bold bg-primary-50 dark:bg-primary-800/30 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded">123456</code>
            </p>
        </div>
    );
}

export default VerifyOtp;
