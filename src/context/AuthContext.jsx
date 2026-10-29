import { createContext, useContext, useEffect, useState } from "react";
import api, { initializeCsrfCookie } from "../api/api";

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

        try {
            const response = await api.get("/user");

            setUser(response.data);
            setAuthenticated(true);
        } catch (error) {
            console.error("Token inválido:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
            setAuthenticated(false);
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
        await initializeCsrfCookie();
        const response = await api.post("/login", {
            email,
            password,
            device_name: "react_app",
        });
        const { token, user: authenticatedUser } = response.data;

        if (!token || !authenticatedUser) {
            throw new Error("A resposta do login não contém os dados de autenticação esperados.");
        }

        localStorage.setItem("token", token);
        setSession(authenticatedUser);
    };

    const register = async (userData) => {
        await initializeCsrfCookie();
        const response = await api.post("/register", {
            ...userData,
            device_name: "react_app",
        });
        const { token, user: registeredUser } = response.data;

        if (!token || !registeredUser) {
            throw new Error("A resposta do cadastro não contém os dados de autenticação esperados.");
        }

        localStorage.setItem("token", token);
        setSession(registeredUser);
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Erro no logout:", error);
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
