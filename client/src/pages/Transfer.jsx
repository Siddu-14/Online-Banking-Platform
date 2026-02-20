import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount } from '../store/accountSlice';
import {
    HiOutlineCurrencyRupee,
    HiOutlineDocumentText,
    HiOutlineIdentification,
    HiOutlineArrowsRightLeft,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, Card, FormField, SuccessMessage } from '../components/ui';

function Transfer() {
    const [recipientAccount, setRecipientAccount] = useState('');
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
        if (!recipientAccount.trim()) { toast.error('Enter recipient account number'); return; }
        if (account && amt > account.balance) { toast.error('Insufficient balance'); return; }

        setLoading(true);
        try {
            const { data } = await api.post('/account/transfer', {
                recipientAccountNumber: recipientAccount.trim(),
                amount: amt,
                description: description || undefined,
            });
            setSuccess(data);
            toast.success('Transfer successful!');
            setRecipientAccount('');
            setAmount('');
            setDescription('');
            const accRes = await api.get('/account/me');
            dispatch(setAccount(accRes.data.account));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 stagger-children">
            <PageHeader
                title="Transfer Money"
                subtitle="Send money to another NexusBank account"
                icon={HiOutlineArrowsRightLeft}
            />

            {account && (
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Available Balance</p>
                        <p className="text-2xl font-bold text-dark-900 dark:text-white tracking-tight">{formatCurrency(account.balance)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Your Account</p>
                        <p className="text-sm font-mono font-semibold text-dark-700 dark:text-dark-200">{account.accountNumber}</p>
                    </div>
                </Card>
            )}

            {success && (
                <SuccessMessage title="Transfer Successful!" onDismiss={() => setSuccess(null)} dismissText="Make another transfer">
                    New balance: <span className="font-bold text-dark-900 dark:text-white">₹{success.balance?.toLocaleString()}</span>
                </SuccessMessage>
            )}

            <Card padding="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="Recipient Account Number" icon={HiOutlineIdentification}>
                        <input type="text" placeholder="Enter 10-digit account number" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} className="input-field pl-12 font-mono tracking-wider" required />
                    </FormField>

                    <FormField label="Amount" icon={HiOutlineCurrencyRupee}>
                        <input type="number" min="1" step="0.01" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field pl-12 text-lg font-semibold" required />
                    </FormField>

                    <FormField label="Description" icon={HiOutlineDocumentText} hint="Optional — e.g., Rent, Payment">
                        <input type="text" placeholder="What's this transfer for?" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field pl-12" />
                    </FormField>

                    <button type="submit" disabled={loading || (account && parseFloat(amount) > account.balance)} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-lg">
                        {loading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <HiOutlineArrowsRightLeft className="w-5 h-5" />
                                Transfer {amount ? `₹${parseFloat(amount).toLocaleString()}` : ''}
                            </>
                        )}
                    </button>
                </form>
            </Card>
        </div>
    );
}

export default Transfer;
