import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Footer() {
  const { authenticated } = useAuth();
  const createPath = authenticated ? "/create" : "/register";
  const scriptsPath = authenticated ? "/showAll" : "/login";
  const scriptsLabel = authenticated ? "Meus roteiros" : "Entrar";

  return (
    <footer className="home-footer">
      <div className="home-footer-inner">
        <div className="home-footer-main">
          <div className="home-footer-about">
            <Link className="home-footer-brand" to="/">ScriptAI</Link>
            <p>Transforme suas ideias em roteiros com a sua voz.</p>
          </div>

          <nav className="home-footer-nav" aria-label="Links do rodapé">
            <h2>Acesso rápido</h2>
            <Link to={createPath}>Criar roteiro</Link>
            <Link to={scriptsPath}>{scriptsLabel}</Link>
          </nav>
        </div>

        <div className="home-footer-bottom">
          <p>ScriptAI © {new Date().getFullYear()} Todos os direitos reservados.</p>
          <div className="home-footer-credits">
            <p>Desenvolvido por Henrique Gonçalves Bossle.</p>
            <a
              className="home-footer-social"
              href="https://www.instagram.com/henriquegbossle/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Henrique Gonçalves Bossle (@henriquegbossle)"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="6.5" r="1" fill="currentColor" />
              </svg>
              
            </a>
            <a
              className="home-footer-social"
              href="https://www.linkedin.com/in/henrique-bossle/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn de Henrique Gonçalves Bossle"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.4 9h3.7v12H3.4V9Zm5.9 0h3.5v1.6h.1c.5-.9 1.7-2 3.5-2 3.8 0 4.5 2.5 4.5 5.7V21h-3.7v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.3V9Z" />
              </svg>
              
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
