import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccount } from '../store/accountSlice';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineBanknotes, HiOutlineCheckCircle, HiOutlinePencilSquare } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, Card, FormField } from '../components/ui';

function Profile() {
    const { user } = useSelector((s) => s.auth);
    const { account } = useSelector((s) => s.account);
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phone: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ fullName: user.fullName || '', phone: user.phone || '' });
        if (!account) api.get('/account/me').then(({ data }) => dispatch(setAccount(data.account)));
    }, [user, account, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/user/profile', form);
            toast.success('Profile updated!');
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const formatCurrency = (amt) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

    return (
        <div className="max-w-3xl mx-auto space-y-8 stagger-children">
            <PageHeader
                title="Profile"
                subtitle="Manage your account details"
                icon={HiOutlineUser}
                action={
                    !editing && (
                        <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
                            <HiOutlinePencilSquare className="w-4 h-4" /> Edit Profile
                        </button>
                    )
                }
            />

            {/* Profile Banner */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative">
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        }}
                    />
                </div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10 relative z-10">
                        <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary-500/25 ring-4 ring-white dark:ring-dark-800">
                            {initials}
                        </div>
                        <div className="pb-1">
                            <h2 className="text-xl font-bold text-dark-900 dark:text-white">{user?.fullName}</h2>
                            <p className="text-sm text-dark-400">{user?.email}</p>
                        </div>
                        <div className="sm:ml-auto pb-1">
                            <span className="badge-success flex items-center gap-1.5">
                                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                Verified Account
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card hover className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                        <HiOutlineBanknotes className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide">Account Number</p>
                        <p className="text-lg font-mono font-bold text-dark-900 dark:text-white tracking-wider">{account?.accountNumber || '—'}</p>
                    </div>
                </Card>
                <Card hover className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
                        <HiOutlineBanknotes className="w-6 h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide">Balance</p>
                        <p className="text-lg font-bold text-success-600 dark:text-success-400">{formatCurrency(account?.balance)}</p>
                    </div>
                </Card>
            </div>

            {/* Edit Form */}
            {editing && (
                <Card padding="p-8" className="animate-slide-up">
                    <h3 className="text-lg font-semibold text-dark-800 dark:text-dark-100 mb-6">Edit Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormField label="Full Name" icon={HiOutlineUser}>
                            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field pl-12" required />
                        </FormField>
                        <FormField label="Phone Number" icon={HiOutlinePhone}>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-12" />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 px-8">
                                {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Personal Info */}
            <Card>
                <h3 className="text-lg font-semibold text-dark-800 dark:text-dark-100 mb-5">Personal Information</h3>
                <div className="space-y-4">
                    {[
                        { icon: HiOutlineUser, label: 'Full Name', value: user?.fullName },
                        { icon: HiOutlineEnvelope, label: 'Email', value: user?.email },
                        { icon: HiOutlinePhone, label: 'Phone', value: user?.phone || 'Not set' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-dark-100/80 dark:bg-dark-800/80 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-dark-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide">{label}</p>
                                <p className="text-sm font-medium text-dark-800 dark:text-dark-100">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default Profile;
