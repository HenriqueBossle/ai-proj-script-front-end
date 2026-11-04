
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // A API usa Sanctum Personal Access Tokens; não há sessão por cookie neste cliente.
    withCredentials: false,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Adiciona o Bearer Token automaticamente
api.interceptors.request.use((config) => {
    const path = new URL(config.url || "", config.baseURL || window.location.origin).pathname;
    const isPublicAuthRequest = /\/((login)|(register))\/?$/.test(path);
    const token = isPublicAuthRequest ? null : localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

// Tratamento de erros das requisições
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (import.meta.env.DEV) {
            // Nunca registre o config, payload ou headers: podem conter credenciais.
            console.warn("Falha na API", {
                status: error.response?.status ?? null,
                code: error.code ?? null,
                hasResponse: Boolean(error.response),
            });
        }

        return Promise.reject(error);
    }
);

export default api;
