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
      <main className="mx-auto max-w-2xl p-6 text-center" role="status" aria-live="polite">
        <p>Carregando roteiro para edição...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Editar roteiro</h1>
          <p className="text-sm text-gray-600">Atualize os dados do roteiro e solicite uma nova geração.</p>
        </div>
        <Link to={`/show/${scriptId}`} className="rounded border px-3 py-2 text-sm hover:bg-gray-50">
          Voltar
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-white p-4 shadow-sm sm:p-6">
        <div>
          <label htmlFor="topic" className="mb-1 block font-medium text-gray-700">
            Tema do roteiro
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="w-full rounded border p-2.5 outline-none focus:border-blue-500"
            aria-invalid={Boolean(fieldErrors.topic)}
            required
          />
          {fieldErrors.topic && <p className="mt-1 text-sm text-red-600">{fieldErrors.topic}</p>}
        </div>

        <div>
          <label htmlFor="sourceText" className="mb-1 block font-medium text-gray-700">
            Texto de fonte
          </label>
          <textarea
            id="sourceText"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            className="h-32 w-full rounded border p-2.5 outline-none focus:border-blue-500"
            aria-invalid={Boolean(fieldErrors.source_text)}
            required
          />
          {fieldErrors.source_text && <p className="mt-1 text-sm text-red-600">{fieldErrors.source_text}</p>}
        </div>

        <div>
          <label htmlFor="styleText" className="mb-1 block font-medium text-gray-700">
            Referência de estilo
          </label>
          <textarea
            id="styleText"
            value={styleText}
            onChange={(event) => setStyleText(event.target.value)}
            className="h-32 w-full rounded border p-2.5 outline-none focus:border-blue-500"
            aria-invalid={Boolean(fieldErrors.style_text)}
            required
          />
          {fieldErrors.style_text && <p className="mt-1 text-sm text-red-600">{fieldErrors.style_text}</p>}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>

          <Link
            to={`/show/${scriptId}`}
            className="rounded border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}

export default ScriptEdit;
