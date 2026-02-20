import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount } from '../store/accountSlice';
import { HiOutlineCurrencyRupee, HiOutlineDocumentText, HiOutlineArrowUpTray, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, Card, FormField, SuccessMessage } from '../components/ui';

function Withdraw() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const { account } = useSelector((s) => s.account);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!account) {
            api.get('/account/me').then(({ data }) => dispatch(setAccount(data.account)));
        }
    }, [account, dispatch]);

    const formatCurrency = (amt) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
        if (account && amt > account.balance) { toast.error('Insufficient balance'); return; }

        setLoading(true);
        try {
            const { data } = await api.post('/account/withdraw', { amount: amt, description: description || undefined });
            setSuccess(data);
            toast.success(`₹${amt.toLocaleString()} withdrawn successfully!`);
            setAmount('');
            setDescription('');
            const accRes = await api.get('/account/me');
            dispatch(setAccount(accRes.data.account));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    const isOverBalance = account && parseFloat(amount) > account.balance;

    return (
        <div className="max-w-2xl mx-auto space-y-8 stagger-children">
            <PageHeader
                title="Withdraw Money"
                subtitle="Withdraw funds from your account"
                icon={HiOutlineArrowUpTray}
            />

            {/* Balance info */}
            {account && (
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Available Balance</p>
                        <p className="text-2xl font-bold text-dark-900 dark:text-white tracking-tight">{formatCurrency(account.balance)}</p>
                    </div>
                    {isOverBalance && (
                        <div className="badge-danger flex items-center gap-1.5 px-3 py-1.5">
                            <HiOutlineExclamationTriangle className="w-4 h-4" />
                            Insufficient
                        </div>
                    )}
                </Card>
            )}

            {success && (
                <SuccessMessage title="Withdrawal Successful!" onDismiss={() => setSuccess(null)} dismissText="Make another withdrawal">
                    New balance: <span className="font-bold text-dark-900 dark:text-white">₹{success.balance?.toLocaleString()}</span>
                </SuccessMessage>
            )}

            <Card padding="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="Amount" icon={HiOutlineCurrencyRupee}>
                        <input type="number" min="1" step="0.01" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field pl-12 text-lg font-semibold" required />
                    </FormField>

                    <FormField label="Description" icon={HiOutlineDocumentText} hint="Optional — e.g., ATM, Bills">
                        <input type="text" placeholder="What's this withdrawal for?" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field pl-12" />
                    </FormField>

                    <button type="submit" disabled={loading || isOverBalance} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-lg">
                        {loading ? <LoadingSpinner size="sm" /> : `Withdraw ${amount ? `₹${parseFloat(amount).toLocaleString()}` : ''}`}
                    </button>
                </form>
            </Card>
        </div>
    );
}

export default Withdraw;
