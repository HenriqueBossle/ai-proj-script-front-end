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
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4 text-left sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="m-0 text-3xl font-bold">Meus roteiros</h1>
          <p className="mt-2 text-gray-600">Acompanhe e gerencie os roteiros que você criou.</p>
        </div>
        <Link
          to="/create"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Criar roteiro
        </Link>
      </header>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          <p>{error}</p>
          {!loading && (
            <button type="button" onClick={() => loadScripts()} className="rounded border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100">
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-gray-600" role="status" aria-live="polite">Carregando seus roteiros...</p>
      ) : error ? null : scripts.length === 0 ? (
        <section className="space-y-3 rounded-lg border border-dashed p-8 text-center sm:p-12">
          <h2 className="text-xl font-semibold">Você ainda não criou roteiros</h2>
          <p className="text-gray-600">Comece informando o assunto, os fatos de referência e o estilo desejado.</p>
          <Link to="/create" className="inline-block rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            Criar meu primeiro roteiro
          </Link>
        </section>
      ) : (
        <ul className="space-y-4">
          {scripts.map((script) => {
            const label = statusLabels[script.status] || "Status indisponível";
            const date = formatDate(script.created_at);

            return (
              <li key={script.id} className="rounded-lg border bg-white p-4 shadow-sm sm:p-5">
                <article className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-xl font-semibold">{script.topic || "Roteiro sem título"}</h2>
                      {date && <p className="mt-1 text-sm text-gray-500">Criado em {date}</p>}
                    </div>
                    <span className="rounded border px-3 py-1 text-sm font-medium" role="status">
                      {label}
                    </span>
                  </div>

                  {script.status === "failed" && (
                    <p className="text-sm text-red-700">A geração não foi concluída. Você pode editar o roteiro para solicitar uma nova geração.</p>
                  )}

                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Link to={`/show/${script.id}`} className="rounded border px-3 py-2 text-sm font-medium hover:bg-gray-50">
                      Ver roteiro
                    </Link>
                    <Link to={`/edit/${script.id}`} className="rounded border px-3 py-2 text-sm font-medium hover:bg-gray-50">
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(script)}
                      disabled={deletingId === script.id}
                      className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
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
