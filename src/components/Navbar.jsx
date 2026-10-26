import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    navigate("/login");
    setLoggingOut(false);
  };

  return (
    <nav className="space-navbar" aria-label="Navegação principal">
      <div className="navbar-inner">
        <NavLink className="space-brand" to={isAuthenticated ? "/create" : "/"} aria-label="Roteiro Cósmico — início">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>Script<span className="brand-accent">AI</span></span>
        </NavLink>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <NavLink to="/create" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                Criar roteiro
              </NavLink>
              <NavLink to="/showAll" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                Meus roteiros
              </NavLink>
              <span className="navbar-user">{user?.name || "Explorador"}</span>
              <button type="button" className="navbar-logout" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? "Saindo..." : "Sair"}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                Entrar
              </NavLink>
              <NavLink to="/register" className="navbar-join">Criar conta</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
