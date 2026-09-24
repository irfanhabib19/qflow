import axios from "axios";

// =====================================================
// API CONFIGURATION
// =====================================================
//
// Local:
// VITE_API_URL=http://localhost:8080/api
//
// Production:
// VITE_API_URL=https://qflow-ramd.onrender.com/api
//

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
    (config) => {

        // Do not attach JWT to authentication requests
        const isAuthRequest =
            config.url === "/auth/login" ||
            config.url === "/auth/register";

        if (!isAuthRequest) {

            const token =
                localStorage.getItem("qflow_token");

            if (token) {
                config.headers.Authorization =
                    `Bearer ${token}`;
            }
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(

    (response) => {
        return response;
    },

    (error) => {

        // JWT expired / invalid
        if (error.response?.status === 401) {

            localStorage.removeItem("qflow_token");
            localStorage.removeItem("qflow_user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default api;