import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function ScriptCreate(){
    const [topic, setTopic] = useState("");
    const [sourceText, setSourceText] = useState("");
    const [styleText, setStyleText] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        const response = await api.post('/scripts', {
          topic,
          source_text: sourceText,
          style_text: styleText,
        });

        const scriptId = response.data.data.id;

        navigate(`/show/${scriptId}`);
        } catch (error) {
          console.error('Erro ao criar roteiro:', error);
          alert('Ocorreu um erro ao iniciar a geração de roteiro.');
        } finally {
          setLoading(false);
        }
    };

    return(
        <>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Criar Novo Roteiro com IA</h2>
      
      <div>
        <label className="block font-medium">Tema do roteiro</label>
        <input 
          type="text" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Texto de fonte (Source Text)</label>
        <textarea 
          value={sourceText} 
          onChange={(e) => setSourceText(e.target.value)} 
          className="w-full border p-2 rounded h-32"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Estilo de Referência (Style Text)</label>
        <textarea 
          value={styleText} 
          onChange={(e) => setStyleText(e.target.value)} 
          className="w-full border p-2 rounded h-32"
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Enviando para a fila...' : 'Gerar Roteiro'}
      </button>
    </form>
    </>
    )
}

export default ScriptCreate