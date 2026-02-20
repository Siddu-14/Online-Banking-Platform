import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAccount } from '../store/accountSlice';
import { HiOutlineBanknotes, HiOutlineCurrencyRupee, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageHeader, Card, FormField, QuickAmountGrid, SuccessMessage } from '../components/ui';

function Deposit() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const dispatch = useDispatch();

    const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/account/deposit', {
                amount: parseFloat(amount),
                description: description || undefined,
            });
            dispatch(setAccount({ ...data, balance: data.balance }));
            setSuccess(data);
            toast.success(`₹${parseFloat(amount).toLocaleString()} deposited successfully!`);
            setAmount('');
            setDescription('');

            const accRes = await api.get('/account/me');
            dispatch(setAccount(accRes.data.account));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deposit failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 stagger-children">
            <PageHeader
                title="Deposit Money"
                subtitle="Add funds to your account instantly"
                icon={HiOutlineArrowDownTray}
            />

            {success && (
                <SuccessMessage title="Deposit Successful!" onDismiss={() => setSuccess(null)} dismissText="Make another deposit">
                    New balance: <span className="font-bold text-dark-900 dark:text-white">₹{success.balance?.toLocaleString()}</span>
                </SuccessMessage>
            )}

            <Card padding="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="Quick Select">
                        <QuickAmountGrid amounts={quickAmounts} selected={amount} onSelect={setAmount} />
                    </FormField>

                    <FormField label="Amount" icon={HiOutlineCurrencyRupee}>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field pl-12 text-lg font-semibold"
                            required
                        />
                    </FormField>

                    <FormField label="Description" icon={HiOutlineDocumentText} hint="Optional — e.g., Salary, Savings">
                        <input
                            type="text"
                            placeholder="What's this deposit for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field pl-12"
                        />
                    </FormField>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-lg">
                        {loading ? <LoadingSpinner size="sm" /> : (
                            <>
                                <HiOutlineBanknotes className="w-5 h-5" />
                                Deposit {amount ? `₹${parseFloat(amount).toLocaleString()}` : ''}
                            </>
                        )}
                    </button>
                </form>
            </Card>
        </div>
    );
}

// Import needed for PageHeader icon
import { HiOutlineArrowDownTray } from 'react-icons/hi2';

export default Deposit;
