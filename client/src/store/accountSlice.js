import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    account: null,
    transactions: [],
    stats: null,
    chartData: [],
    loading: false,
    error: null,
};

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setAccount: (state, action) => {
            state.account = action.payload;
        },
        setTransactions: (state, action) => {
            state.transactions = action.payload;
        },
        setStats: (state, action) => {
            state.stats = action.payload.stats;
            state.chartData = action.payload.chartData;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearAccount: (state) => {
            state.account = null;
            state.transactions = [];
            state.stats = null;
            state.chartData = [];
        },
    },
});

export const { setAccount, setTransactions, setStats, setLoading, setError, clearAccount } = accountSlice.actions;
export default accountSlice.reducer;
