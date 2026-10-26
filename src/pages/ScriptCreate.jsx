import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function ScriptCreate() {
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [styleText, setStyleText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <main className="page-shell">
      <header className="page-heading">
        <span className="eyebrow">Laboratório de criação</span>
        <h1>Uma ideia, uma nova órbita.</h1>
        <p>Defina o tema, forneça os fatos autorizados e indique como a história deve soar.</p>
      </header>

      <form onSubmit={handleSubmit} className="panel form-panel field-stack">
        <div className="field">
          <label htmlFor="topic">Tema do roteiro</label>
          <p className="field-hint">O assunto e o objetivo do vídeo.</p>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex.: Como os telescópios revelam galáxias distantes"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="sourceText">Fontes e fatos</label>
          <p className="field-hint">A base factual que deve orientar o roteiro. Inclua textos ou dados relevantes.</p>
          <textarea
            id="sourceText"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Cole aqui os fatos e materiais de referência..."
            required
          />
        </div>

        <div className="field">
          <label htmlFor="styleText">Base de escrita</label>
          <p className="field-hint">Uma referência de voz, ritmo e estilo — não uma fonte de fatos.</p>
          <textarea
            id="styleText"
            value={styleText}
            onChange={(e) => setStyleText(e.target.value)}
            placeholder="Descreva ou cole uma amostra do estilo desejado..."
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="primary-button">
            <span aria-hidden="true">✦</span>{loading ? 'Enviando para a fila...' : 'Gerar roteiro'}
          </button>
          <Link to="/showAll" className="text-button">Ver todos os roteiros já gerados</Link>
        </div>
      </form>
    </main>
  );
}

export default ScriptCreate;
