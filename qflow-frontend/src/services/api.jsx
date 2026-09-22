import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081/api",
});


// ===============================
// REQUEST INTERCEPTOR
// ===============================

api.interceptors.request.use(
    (config) => {

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


// ===============================
// RESPONSE INTERCEPTOR
// ===============================

api.interceptors.response.use(

    (response) => {
        return response;
    },

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("qflow_token");
            localStorage.removeItem("qflow_user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);


// ===============================
// DEFAULT EXPORT
// ===============================

export default api;