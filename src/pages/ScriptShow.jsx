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

function getReviewErrorMessage(error) {
  if (!error.response) {
    return "Não foi possível comunicar com a API para solicitar a revisão.";
  }

  switch (error.response.status) {
    case 401:
      return "Sua sessão expirou. Entre novamente para revisar este roteiro.";
    case 403:
      return "Você não tem permissão para revisar este roteiro.";
    case 404:
      return "Este roteiro não foi encontrado ou não está disponível.";
    case 409:
      return "Este roteiro está sendo processado ou ainda não possui conteúdo para revisão.";
    case 422:
      return error.response.data?.errors?.instruction?.[0]
        || "Verifique a instrução de revisão e tente novamente.";
    case 429:
      return "Muitas solicitações em pouco tempo. Aguarde e tente novamente.";
    case 503:
      return "Não foi possível iniciar a revisão. O conteúdo anterior foi mantido.";
    default:
      return "Não foi possível revisar o roteiro. O conteúdo anterior foi mantido.";
  }
}

function ScriptShow() {
  const { scriptId } = useParams();
  return <ScriptShowContent key={scriptId} scriptId={scriptId} />;
}

function ScriptShowContent({ scriptId }) {
  const [script, setScript] = useState(null);
  const [request, setRequest] = useState({
    scriptId: null,
    reload: -1,
    error: "",
    loading: true,
  });
  const [reload, setReload] = useState(0);
  const [pollCycle, setPollCycle] = useState(0);
  const [pollError, setPollError] = useState("");
  const [instruction, setInstruction] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewActive, setReviewActive] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchScript = async () => {
      try {
        const response = await api.get(`/scripts/${scriptId}`, {
          signal: controller.signal,
        });

        if (!active) return;

        const loadedScript = response.data?.data;
        if (!loadedScript || typeof loadedScript !== "object") {
          setRequest({
            scriptId,
            reload,
            error: "A API retornou uma resposta inválida para este roteiro.",
            loading: false,
          });
          return;
        }

        setScript(loadedScript);
        setPollError("");
        setRequest({ scriptId, reload, error: "", loading: false });
      } catch (requestError) {
        if (!active || requestError.name === "CanceledError" || requestError.code === "ERR_CANCELED") {
          return;
        }

        setRequest({
          scriptId,
          reload,
          error: getLoadErrorMessage(requestError),
          loading: false,
        });
      }
    };

    fetchScript();

    return () => {
      active = false;
      controller.abort();
    };
  }, [scriptId, reload]);

  const isCurrentRequest = request.scriptId === scriptId && request.reload === reload;
  const isCurrentScript = script?.id != null && String(script.id) === scriptId;
  const currentScript = isCurrentScript ? script : null;
  const currentStatus = currentScript?.status;

  useEffect(() => {
    if (currentStatus !== "pending" && currentStatus !== "processing") return undefined;

    let active = true;
    let controller;
    const timeoutId = setTimeout(async () => {
      controller = new AbortController();

      try {
        const response = await api.get(`/scripts/${scriptId}`, {
          signal: controller.signal,
        });

        if (!active) return;

        const latestScript = response.data?.data;
        if (!latestScript || typeof latestScript !== "object") {
          setPollError("A API retornou uma resposta inválida ao atualizar o roteiro.");
          return;
        }

        setScript(latestScript);
        setPollError("");
        setPollCycle((cycle) => cycle + 1);

        if (reviewActive && latestScript.status === "done") {
          setReviewActive(false);
          setReviewSuccess("A revisão foi concluída e a versão atualizada já está exibida.");
        } else if (reviewActive && latestScript.status === "failed") {
          setReviewActive(false);
          setReviewError("A revisão falhou. O roteiro anterior foi mantido.");
          setReviewSuccess("");
        }
      } catch (requestError) {
        if (!active || requestError.name === "CanceledError" || requestError.code === "ERR_CANCELED") {
          return;
        }

        setPollError(getLoadErrorMessage(requestError));
      }
    }, 3000);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller?.abort();
    };
  }, [scriptId, currentStatus, pollCycle, reviewActive]);

  const handleReview = async (event) => {
    event.preventDefault();

    const reviewInstruction = instruction.trim();
    if (!reviewInstruction || reviewing) return;

    setReviewing(true);
    setReviewError("");
    setReviewSuccess("");
    setPollError("");

    try {
      const response = await api.post(`/scripts/${scriptId}/revise`, {
        instruction: reviewInstruction,
      });

      const revisedScript = response.data?.data;
      if (!revisedScript || typeof revisedScript !== "object") {
        setReviewError("A API retornou uma resposta inválida. O conteúdo atual foi mantido.");
        return;
      }

      setScript(revisedScript);
      setInstruction("");

      if (revisedScript.status === "processing" || revisedScript.status === "pending") {
        setReviewActive(true);
        setReviewSuccess("Revisão iniciada. O roteiro salvo anteriormente continua visível.");
      } else if (revisedScript.status === "done") {
        setReviewSuccess("A revisão foi concluída e a versão atualizada já está exibida.");
      } else if (revisedScript.status === "failed") {
        setReviewError("A revisão falhou. O roteiro anterior foi mantido.");
      }
    } catch (requestError) {
      setReviewError(getReviewErrorMessage(requestError));
    } finally {
      setReviewing(false);
    }
  };

  const isLoading = !isCurrentRequest || request.loading;
  const loadError = isCurrentRequest ? request.error : "";

  if (isLoading && !currentScript) {
    return (
      <main className="page-shell">
        <section className="panel loading-panel" role="status" aria-live="polite"><div className="loading-orbit" aria-hidden="true" /><h1>Carregando roteiro...</h1><div className="skeleton" /><div className="skeleton" /></section>
      </main>
    );
  }

  if (loadError && !currentScript) {
    return (
      <main className="page-shell">
        <header className="page-heading"><span className="eyebrow">Sinal perdido</span><h1>Não foi possível abrir o roteiro</h1></header>
        <section className="panel form-panel field-stack">
        <p className="form-error" role="alert">{loadError}</p>
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

  if (!currentScript) return null;

  const createdAt = currentScript.created_at ? new Date(currentScript.created_at) : null;
  const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());
  const hasContent = typeof currentScript.generated_content === "string"
    && currentScript.generated_content.trim().length > 0;
  const isProcessing = currentScript.status === "pending" || currentScript.status === "processing";
  const statusLabels = {
    pending: "Aguardando",
    processing: "Em processamento",
    done: "Concluído",
    failed: "Falha no processamento",
  };
  const statusClass = currentScript.status === "done"
    ? "status-done"
    : currentScript.status === "failed"
      ? "status-failed"
      : currentScript.status === "pending" || currentScript.status === "processing"
        ? "status-processing"
        : "";

  return (
    <main className="page-shell">
      <header className="result-header">
        <span className={`status-pill ${statusClass}`}>
          {statusLabels[currentScript.status] || "Status desconhecido"}
        </span>
        <h1>{currentScript.topic}</h1>
        {hasValidCreatedAt && (
          <p className="muted">
            Criado em: {createdAt.toLocaleString("pt-BR")}
          </p>
        )}
      </header>

      {isProcessing && (
        <p className="muted" role="status" aria-live="polite">
          O roteiro está sendo processado. {hasContent
            ? "O conteúdo salvo anteriormente continua visível."
            : "Esta página será atualizada automaticamente quando houver conteúdo."}
        </p>
      )}

      {currentScript.status === "failed" && (
        <p className="form-error" role="alert">
          O processamento falhou. {hasContent
            ? "O conteúdo salvo anteriormente foi mantido."
            : "Você pode tentar gerar o roteiro novamente mais tarde."}
        </p>
      )}

      {pollError && (
        <div className="notice-error" role="alert">
          <span>{pollError}</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setPollError("");
              setPollCycle((cycle) => cycle + 1);
            }}
          >
            Tentar atualizar
          </button>
        </div>
      )}

      <section className="panel result-panel">
        <h2>Roteiro gerado</h2>
        {hasContent ? (
          <div className="result-content">{currentScript.generated_content}</div>
        ) : (
          <p className="muted">
            {isProcessing
              ? "O conteúdo do roteiro estará disponível quando o processamento terminar."
              : "O roteiro foi concluído, mas não há conteúdo disponível."}
          </p>
        )}
      </section>

      {hasContent && (
        <section className="panel form-panel field-stack" aria-labelledby="review-heading">
          <div>
            <h2 id="review-heading">Revisão contextual</h2>
            <p className="muted">
              Descreva o que deseja alterar. A IA usará este roteiro como contexto e manterá os fatos da fonte original.
            </p>
          </div>

          {reviewError && <p className="form-error" role="alert">{reviewError}</p>}
          {reviewSuccess && <p className="muted" role="status" aria-live="polite">{reviewSuccess}</p>}

          <form onSubmit={handleReview} className="field-stack">
            <div className="field">
              <label htmlFor="reviewInstruction">O que você gostaria de revisar?</label>
              <p className="field-hint" id="reviewInstructionHint">
                Ex.: “Melhore a introdução” ou “Adicione exemplos práticos ao desenvolvimento”.
              </p>
              <textarea
                id="reviewInstruction"
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                maxLength={20000}
                required
                disabled={isProcessing || reviewing}
                aria-describedby="reviewInstructionHint reviewInstructionCount"
                aria-invalid={Boolean(reviewError)}
                placeholder="Descreva as alterações desejadas, preservando o contexto do roteiro."
              />
              <p className="field-hint" id="reviewInstructionCount" aria-live="polite">
                {instruction.length}/600 caracteres
              </p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={isProcessing || reviewing || !instruction.trim()}
              >
                {reviewing ? "Enviando revisão..." : "Revisar com IA"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="card-actions">
        <Link to="/showAll" className="secondary-button">
          Voltar aos roteiros
        </Link>
        <Link to={`/edit/${currentScript.id}`} className="secondary-button">
          Editar metadados
        </Link>
      </div>
    </main>
  );
}

export default ScriptShow;
