import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 429) {
            console.warn(
                "Limite de solicitações atingido."
            );
        }

        return Promise.reject(error);
    }
);

export const initializeCsrfCookie = () => {
    const csrfCookieUrl = new URL("/sanctum/csrf-cookie", api.defaults.baseURL);
    return api.get(csrfCookieUrl.toString());
};

export default api;