import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }){
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthentication = async () => {
        const token = localStorage.getItem("token");

        if(!token) {
            setAuthenticated(false);
            setUser(null);
            setLoading(false);
            return;
        }

        // Keep the cached identity available while validating the token after reload.
        try {
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
                setUser(JSON.parse(cachedUser));
                setAuthenticated(true);
            }
        } catch {
            localStorage.removeItem("user");
        }

        try {
            const response = await api.get("/user");

            setUser(response.data);
            setAuthenticated(true);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn("Falha ao restaurar sessão", {
                    status: error.response?.status ?? null,
                    code: error.code ?? null,
                    hasResponse: Boolean(error.response),
                });
            }

            // A falha de rede não prova que o token é inválido. Só 401 encerra a sessão.
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    const setSession = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setAuthenticated(true);
    };

    const login = async ({ email, password }) => {
        const response = await api.post("/login", {
            email,
            password,
            device_name: "react_app",
        });
        const { token, user: authenticatedUser } = response.data ?? {};

        if (!token || !authenticatedUser) {
            throw new Error("A resposta do login não contém os dados de autenticação esperados.");
        }

        localStorage.setItem("token", token);
        setSession(authenticatedUser);
    };

    const register = async (userData) => {
        const response = await api.post("/register", {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            password_confirmation: userData.password_confirmation,
            device_name: "react_app",
        });

        const { token, user: registeredUser } = response.data ?? {};

        if (!token || !registeredUser) {
            throw new Error(
                "A resposta do cadastro não contém os dados de autenticação esperados."
            );
        }

        localStorage.setItem("token", token);
        setSession(registeredUser);
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn("Falha ao encerrar sessão na API", {
                    status: error.response?.status ?? null,
                    code: error.code ?? null,
                    hasResponse: Boolean(error.response),
                });
            }
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
            setAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                setAuthenticated,
                user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
