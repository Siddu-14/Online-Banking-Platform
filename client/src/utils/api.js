import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logout } from '../store/authSlice';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// ─── CSRF Token Management ──────────────────────────────────────────
let csrfToken = null;

export async function fetchCsrfToken() {
    try {
        const { data } = await axios.get('/api/csrf-token', { withCredentials: true });
        csrfToken = data.csrfToken;
        return csrfToken;
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
        return null;
    }
}

// Fetch CSRF token on module load
fetchCsrfToken();

// ─── Request Interceptor ────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Attach access token
        const state = store.getState();
        const token = state.auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Attach CSRF token for state-changing requests
        if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor (Auto-Refresh + CSRF Retry) ───────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle CSRF token errors — refetch token and retry once
        if (
            error.response?.status === 403 &&
            error.response?.data?.code === 'CSRF_ERROR' &&
            !originalRequest._csrfRetry
        ) {
            originalRequest._csrfRetry = true;
            await fetchCsrfToken();
            originalRequest.headers['x-csrf-token'] = csrfToken;
            return api(originalRequest);
        }

        // Handle expired access token — refresh and retry
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    '/api/auth/refresh',
                    {},
                    {
                        withCredentials: true,
                        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                    }
                );
                store.dispatch(setCredentials({ accessToken: data.accessToken }));
                processQueue(null, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
