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
      <main className="mx-auto max-w-3xl p-6 text-center" role="status" aria-live="polite">
        <p>Carregando roteiro...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Não foi possível abrir o roteiro</h1>
        <p className="text-red-700" role="alert">{error}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setReload((count) => count + 1)}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Tentar novamente
          </button>
          <Link to="/showAll" className="rounded border px-4 py-2 hover:bg-gray-50">
            Voltar aos roteiros
          </Link>
        </div>
      </main>
    );
  }

  if (!script) return null;

  const createdAt = script.created_at ? new Date(script.created_at) : null;
  const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());

  if (script.status === "pending" || script.status === "processing") {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-8 text-center">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold">Seu roteiro está sendo gerado</h1>
        <p className="text-gray-600">A geração acontece em segundo plano. Esta página será atualizada automaticamente.</p>
        <section className="rounded bg-gray-100 p-4 text-left">
          <h2 className="font-semibold">{script.topic}</h2>
          <p className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
            Status: {script.status === "pending" ? "Aguardando" : "Em processamento"}
          </p>
        </section>
      </main>
    );
  }

  if (script.status === "failed") {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold text-red-700">Não foi possível gerar o roteiro</h1>
        <p className="text-gray-700">
          Ocorreu uma falha durante a geração. Você pode voltar à lista e tentar novamente mais tarde.
        </p>
        <Link to="/showAll" className="inline-block rounded border px-4 py-2 hover:bg-gray-50">
          Voltar aos roteiros
        </Link>
      </main>
    );
  }

  if (script.status !== "done") {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Status do roteiro indisponível</h1>
        <p className="text-gray-700">A API retornou um status que esta página não reconhece.</p>
        <Link to="/showAll" className="inline-block rounded border px-4 py-2 hover:bg-gray-50">
          Voltar aos roteiros
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="border-b pb-4">
        <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
          Concluído
        </span>
        <h1 className="mt-2 text-3xl font-bold">{script.topic}</h1>
        {hasValidCreatedAt && (
          <p className="mt-1 text-sm text-gray-500">
            Criado em: {createdAt.toLocaleString("pt-BR")}
          </p>
        )}
      </header>

      <section className="space-y-4 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-800">Roteiro gerado</h2>
        <div className="whitespace-pre-wrap break-words rounded border bg-gray-50 p-4 leading-relaxed text-gray-800">
          {script.generated_content || "O roteiro foi concluído, mas não há conteúdo disponível."}
        </div>
      </section>

      <Link to="/showAll" className="inline-block rounded border px-4 py-2 hover:bg-gray-50">
        Voltar aos roteiros
      </Link>
    </main>
  );
}

export default ScriptShow;
