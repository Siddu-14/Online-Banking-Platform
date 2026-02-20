import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    otpEmail: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { accessToken, user } = action.payload;
            if (accessToken) {
                state.accessToken = accessToken;
                state.isAuthenticated = true;
                localStorage.setItem('accessToken', accessToken);
            }
            if (user) {
                state.user = user;
                localStorage.setItem('user', JSON.stringify(user));
            }
        },
        setOtpEmail: (state, action) => {
            state.otpEmail = action.payload;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.otpEmail = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, setOtpEmail, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
