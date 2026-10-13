import { createContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }){
    const [autheticated, setAuthenticated] = useState(false);
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

    const login = (userData) => {
        setUser(userData);
        setAuthenticated(true);
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
                setAuthenticated,
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);


