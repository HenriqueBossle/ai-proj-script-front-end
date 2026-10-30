import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

function getLoadErrorMessage(error) {
  if (!error.response) {
    return "Não foi possível comunicar com a API. Verifique sua conexão e tente novamente.";
  }

  switch (error.response.status) {
    case 401:
      return "Sua sessão expirou. Entre novamente para editar este roteiro.";
    case 403:
      return "Você não tem permissão para editar este roteiro.";
    case 404:
      return "Este roteiro não foi encontrado ou não está disponível.";
    case 429:
      return "Muitas consultas em pouco tempo. Aguarde e tente novamente.";
    default:
      return "Não foi possível carregar o roteiro para edição. Tente novamente mais tarde.";
  }
}

function getSaveErrorMessage(error) {
  if (!error.response) {
    return "Não foi possível comunicar com a API para salvar as alterações.";
  }

  switch (error.response.status) {
    case 401:
      return "Sua sessão expirou. Entre novamente para salvar as alterações.";
    case 403:
      return "Você não tem permissão para alterar este roteiro.";
    case 404:
      return "Este roteiro não foi encontrado. Atualize a página e tente novamente.";
    case 422:
      return "Verifique os dados do roteiro e tente novamente.";
    case 429:
      return "Muitas requisições em pouco tempo. Aguarde e tente novamente.";
    default:
      return "Não foi possível salvar as alterações. Tente novamente mais tarde.";
  }
}

function ScriptEdit() {
  const { scriptId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [styleText, setStyleText] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadScript = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/scripts/${scriptId}`, { signal: controller.signal });

        if (!isActive) return;

        const script = response.data?.data;

        if (!script || typeof script !== "object") {
          setError("A API retornou uma resposta inválida para este roteiro.");
          setLoading(false);
          return;
        }

        setTopic(script.topic || "");
        setSourceText(script.source_text || "");
        setStyleText(script.style_text || "");
      } catch (requestError) {
        if (!isActive || requestError.name === "CanceledError" || requestError.code === "ERR_CANCELED") {
          return;
        }

        setError(getLoadErrorMessage(requestError));
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadScript();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [scriptId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      await api.put(`/scripts/${scriptId}`, {
        topic,
        source_text: sourceText,
        style_text: styleText,
      });

      navigate(`/show/${scriptId}`);
    } catch (requestError) {
      if (requestError.response?.status === 422) {
        const apiErrors = requestError.response.data?.errors || {};
        setFieldErrors({
          topic: apiErrors.topic?.[0] || "",
          source_text: apiErrors.source_text?.[0] || "",
          style_text: apiErrors.style_text?.[0] || "",
        });
        setError("Revise os campos destacados abaixo e tente novamente.");
        return;
      }

      setError(getSaveErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <section className="panel loading-panel" role="status" aria-live="polite"><div className="loading-orbit" aria-hidden="true" /><h1>Carregando roteiro para edição...</h1></section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-heading card-topline">
        <div>
          <span className="eyebrow">Ajuste de trajetória</span>
          <h1>Editar roteiro</h1>
          <p>Atualize os dados do roteiro e solicite uma nova geração.</p>
        </div>
        <Link to={`/show/${scriptId}`} className="secondary-button">
          Voltar
        </Link>
      </div>

      {error && (
        <div className="notice-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel form-panel field-stack">
        <div className="field">
          <label htmlFor="topic">
            Tema do roteiro
          </label>
          <p className="field-hint">O assunto e o objetivo do vídeo.</p>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            aria-invalid={Boolean(fieldErrors.topic)}
            required
          />
          {fieldErrors.topic && <p className="form-error">{fieldErrors.topic}</p>}
        </div>

        <div className="field">
          <label htmlFor="sourceText">
            Texto de fonte
          </label>
          <p className="field-hint">A base factual autorizada para esta geração.</p>
          <textarea
            id="sourceText"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            aria-invalid={Boolean(fieldErrors.source_text)}
            required
          />
          {fieldErrors.source_text && <p className="form-error">{fieldErrors.source_text}</p>}
        </div>

        <div className="field">
          <label htmlFor="styleText">
            Referência de estilo
          </label>
          <p className="field-hint">A referência de estilo orienta a escrita, não os fatos.</p>
          <textarea
            id="styleText"
            value={styleText}
            onChange={(event) => setStyleText(event.target.value)}
            aria-invalid={Boolean(fieldErrors.style_text)}
            required
          />
          {fieldErrors.style_text && <p className="form-error">{fieldErrors.style_text}</p>}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={saving}
            className="primary-button"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>

          <Link
            to={`/show/${scriptId}`}
            className="secondary-button"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}

export default ScriptEdit;
