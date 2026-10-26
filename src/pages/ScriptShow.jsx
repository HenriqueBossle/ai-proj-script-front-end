import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

function getLoadErrorMessage(error) {
  if (!error.response) {
    return "Não foi possível comunicar com a API. Verifique sua conexão e tente novamente.";
  }

  switch (error.response.status) {
    case 401:
      return "Sua sessão expirou. Entre novamente para acessar este roteiro.";
    case 403:
      return "Você não tem permissão para acessar este roteiro.";
    case 404:
      return "Este roteiro não foi encontrado ou não está disponível.";
    case 429:
      return "Muitas consultas em pouco tempo. Aguarde e tente novamente.";
    default:
      return "Não foi possível carregar o roteiro. Tente novamente mais tarde.";
  }
}

function ScriptShow() {
  const { scriptId } = useParams();
  const [request, setRequest] = useState({
    scriptId: null,
    reload: -1,
    script: null,
    error: "",
    loading: true,
  });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    let timeoutId;
    const controller = new AbortController();

    const fetchScript = async () => {
      try {
        const response = await api.get(`/scripts/${scriptId}`, {
          signal: controller.signal,
        });

        if (!active) return;

        const currentScript = response.data?.data;
        if (!currentScript || typeof currentScript !== "object") {
          setRequest({
            scriptId,
            reload,
            script: null,
            error: "A API retornou uma resposta inválida para este roteiro.",
            loading: false,
          });
          return;
        }

        setRequest({ scriptId, reload, script: currentScript, error: "", loading: false });

        if (currentScript.status === "pending" || currentScript.status === "processing") {
          timeoutId = setTimeout(fetchScript, 3000);
        }
      } catch (requestError) {
        if (!active) return;

        setRequest({
          scriptId,
          reload,
          script: null,
          error: getLoadErrorMessage(requestError),
          loading: false,
        });
      }
    };

    fetchScript();

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [scriptId, reload]);

  const isCurrentRequest = request.scriptId === scriptId && request.reload === reload;
  const loading = !isCurrentRequest || request.loading;
  const error = isCurrentRequest ? request.error : "";
  const script = isCurrentRequest ? request.script : null;

  if (loading) {
    return (
      <main className="page-shell">
        <section className="panel loading-panel" role="status" aria-live="polite"><div className="loading-orbit" aria-hidden="true" /><h1>Navegando pelo universo das ideias...</h1><p>Carregando roteiro</p><div className="skeleton" /><div className="skeleton" /></section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell">
        <header className="page-heading"><span className="eyebrow">Sinal perdido</span><h1>Não foi possível abrir o roteiro</h1></header>
        <section className="panel form-panel field-stack">
        <p className="form-error" role="alert">{error}</p>
        <div className="form-actions">
          <button
            type="button"
            onClick={() => setReload((count) => count + 1)}
            className="primary-button"
          >
            Tentar novamente
          </button>
          <Link to="/showAll" className="secondary-button">
            Voltar aos roteiros
          </Link>
        </div>
        </section>
      </main>
    );
  }

  if (!script) return null;

  const createdAt = script.created_at ? new Date(script.created_at) : null;
  const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());

  if (script.status === "pending" || script.status === "processing") {
    return (
      <main className="page-shell">
        <section className="panel loading-panel">
        <div className="loading-orbit" aria-hidden="true" />
        <h1>Navegando pelo universo das ideias...</h1>
        <p>A geração acontece em segundo plano. Esta página será atualizada automaticamente.</p>
        <div className="panel form-panel" style={{ marginTop: 24, textAlign: "left" }}>
          <h2>{script.topic}</h2>
          <p className="muted" role="status" aria-live="polite">
            Status: {script.status === "pending" ? "Aguardando" : "Em processamento"}
          </p>
        </div>
        </section>
      </main>
    );
  }

  if (script.status === "failed") {
    return (
      <main className="page-shell">
        <section className="panel form-panel field-stack">
        <h1>Não foi possível gerar o roteiro</h1>
        <p className="form-error">
          Ocorreu uma falha durante a geração. Você pode voltar à lista e tentar novamente mais tarde.
        </p>
        <Link to="/showAll" className="secondary-button">
          Voltar aos roteiros
        </Link>
        </section>
      </main>
    );
  }

  if (script.status !== "done") {
    return (
      <main className="page-shell">
        <section className="panel form-panel field-stack">
        <h1>Status do roteiro indisponível</h1>
        <p className="muted">A API retornou um status que esta página não reconhece.</p>
        <Link to="/showAll" className="secondary-button">
          Voltar aos roteiros
        </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="result-header">
        <span className="status-pill status-done">
          Concluído
        </span>
        <h1>{script.topic}</h1>
        {hasValidCreatedAt && (
          <p className="muted">
            Criado em: {createdAt.toLocaleString("pt-BR")}
          </p>
        )}
      </header>

      <section className="panel result-panel">
        <h2>Roteiro gerado</h2>
        <div className="result-content">
          {script.generated_content || "O roteiro foi concluído, mas não há conteúdo disponível."}
        </div>
      </section>
      <div className="card-actions">
      <Link to="/showAll" className="secondary-button" >
        Voltar aos roteiros
      </Link>
      <Link to={`/edit/${script.id}`} className="secondary-button" >
          Editar
      </Link>
      </div>
    </main>
  );
}

export default ScriptShow;
