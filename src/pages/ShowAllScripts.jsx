import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const statusLabels = {
  pending: "Aguardando geração",
  processing: "Gerando roteiro",
  done: "Concluído",
  failed: "Falha na geração",
};

function getErrorMessage(error) {
  if (!error.response) {
    return "Não foi possível comunicar com a API. Verifique sua conexão e tente novamente.";
  }

  switch (error.response.status) {
    case 401:
      return "Sua sessão expirou. Entre novamente para acessar seus roteiros.";
    case 403:
      return "Você não tem permissão para acessar esta lista.";
    case 429:
      return "Muitas requisições em pouco tempo. Aguarde e tente novamente.";
    default:
      return "Não foi possível carregar seus roteiros. Tente novamente mais tarde.";
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("pt-BR");
}

function ShowAllScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadScripts = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/scripts", { signal });
      const results = response.data?.data;

      if (!Array.isArray(results)) {
        throw new Error("Resposta inválida da API");
      }

      setScripts(results);
    } catch (requestError) {
      if (requestError.name === "CanceledError" || requestError.code === "ERR_CANCELED") return;
      setError(requestError.response ? getErrorMessage(requestError) : "A API retornou uma lista inválida ou não foi possível estabelecer conexão.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadScripts(controller.signal);
    return () => controller.abort();
  }, [loadScripts]);

  const handleDelete = async (script) => {
    const confirmed = window.confirm(`Tem certeza de que deseja excluir o roteiro “${script.topic}”?`);
    if (!confirmed) return;

    setDeletingId(script.id);
    setError("");
    try {
      await api.delete(`/scripts/${script.id}`);
      setScripts((currentScripts) => currentScripts.filter((item) => item.id !== script.id));
    } catch (requestError) {
      if (!requestError.response) {
        setError("Não foi possível comunicar com a API para excluir o roteiro.");
      } else if (requestError.response.status === 401) {
        setError("Sua sessão expirou. Entre novamente para excluir este roteiro.");
      } else if (requestError.response.status === 403) {
        setError("Você não tem permissão para excluir este roteiro.");
      } else if (requestError.response.status === 404) {
        setError("Este roteiro não foi encontrado. Atualize a lista e tente novamente.");
      } else {
        setError("Não foi possível excluir o roteiro. Tente novamente mais tarde.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page-shell">
      <header className="page-heading card-topline">
        <div>
          <span className="eyebrow">Seu espaço de criação</span>
          <h1>Missões anteriores</h1>
          <p>Acompanhe e gerencie os roteiros que você criou.</p>
        </div>
        <Link
          to="/create"
          className="primary-button"
        >
          Criar roteiro
        </Link>
      </header>

      {error && (
        <div className="notice-error" role="alert">
          <p>{error}</p>
          {!loading && (
            <button type="button" onClick={() => loadScripts()} className="secondary-button">
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {loading ? (
        <section className="panel loading-panel" role="status" aria-live="polite"><div className="loading-orbit" aria-hidden="true" /><h1>Mapeando suas missões...</h1><p>Carregando seus roteiros</p></section>
      ) : error ? null : scripts.length === 0 ? (
        <section className="panel empty-state">
          <svg viewBox="0 0 160 128" fill="none" aria-hidden="true">
            <circle cx="80" cy="64" r="43" stroke="#7c3aed" strokeOpacity=".38" />
            <ellipse cx="80" cy="64" rx="66" ry="22" transform="rotate(-24 80 64)" stroke="#22d3ee" strokeOpacity=".7" />
            <circle cx="80" cy="64" r="24" fill="#292052" stroke="#a78bfa" />
            <circle cx="72" cy="57" r="5" fill="#f472b6" />
            <circle cx="89" cy="72" r="3" fill="#22d3ee" />
            <path d="M31 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5ZM128 88l2 4 4 2-4 1-2 5-2-5-4-1 4-2 2-4Z" fill="#fbbf24" />
          </svg>
          <h2>Você ainda não criou roteiros</h2>
          <p>Comece informando o assunto, os fatos de referência e o estilo desejado.</p>
          <Link to="/create" className="primary-button">
            Criar meu primeiro roteiro
          </Link>
        </section>
      ) : (
        <ul className="script-list">
          {scripts.map((script) => {
            const label = statusLabels[script.status] || "Status indisponível";
            const date = formatDate(script.created_at);

            return (
              <li key={script.id} className="panel script-card">
                <article>
                  <div className="card-topline">
                    <div>
                      <h2>{script.topic || "Roteiro sem título"}</h2>
                      {date && <p className="muted">Criado em {date}</p>}
                    </div>
                    <span className={`status-pill status-${script.status}`} role="status">
                      {label}
                    </span>
                  </div>

                  {script.status === "failed" && (
                    <p className="form-error">A geração não foi concluída. Você pode editar o roteiro para solicitar uma nova geração.</p>
                  )}

                  <div className="card-actions">
                    <Link to={`/show/${script.id}`} className="secondary-button">
                      Ver roteiro
                    </Link>
                    <Link to={`/edit/${script.id}`} className="secondary-button">
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(script)}
                      disabled={deletingId === script.id}
                      className="danger-button"
                    >
                      {deletingId === script.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default ShowAllScripts;
