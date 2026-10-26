import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    number: "01",
    icon: "✦",
    title: "Defina o tema",
    description: "Conte qual é o assunto e o objetivo do seu vídeo.",
  },
  {
    number: "02",
    icon: "▤",
    title: "Traga os fatos",
    description: "Adicione as informações que devem servir de base ao roteiro.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Escolha o estilo",
    description: "Oriente o tom e o ritmo da escrita do jeito que você imaginou.",
  },
];

function Home() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <main className="home-loading" aria-label="Verificando sua sessão"><span className="loading-orbit" /></main>;
  }

  const createPath = authenticated ? "/create" : "/register";
  const loginPath = authenticated ? "/create" : "/login";

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <span className="eyebrow"><span aria-hidden="true">✦</span> Seu próximo vídeo começa aqui</span>
          <h1 id="home-title">Ideias boas merecem <span>roteiros incríveis.</span></h1>
          <p className="home-lead">
            Transforme o que você sabe em um roteiro pronto para ganhar voz.
            Você escolhe os fatos, o tema e o estilo. A ScriptAI ajuda a dar forma à história.
          </p>
          <div className="home-actions">
            <Link className="primary-button home-primary" to={createPath}>
              Criar meu primeiro roteiro <span aria-hidden="true">→</span>
            </Link>
            <Link className="home-login" to={loginPath}>Já tenho uma conta <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="home-note"><span aria-hidden="true">◎</span> Seus fatos e sua voz guiam cada roteiro.</div>
        </div>

        <div className="home-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-glow" />
          <div className="art-star star-one">✦</div>
          <div className="art-star star-two">✧</div>
          <div className="art-star star-three">·</div>
          <div className="art-card art-card-back">
            <span className="art-card-label">SEU ESTILO</span>
            <span className="art-style-lines"><i /><i /><i /></span>
            <span className="art-card-spark">✧</span>
          </div>
          <div className="art-card art-card-front">
            <div className="art-card-top"><span className="art-card-label">IDEIA EM ROTEIRO</span><span className="art-live"><i /> PRONTO PARA COMEÇAR</span></div>
            <div className="art-title-lines"><i /><i /><i /></div>
            <div className="art-divider" />
            <div className="art-source"><span className="art-source-icon">▤</span><span><b>Fatos que você escolhe</b><small>A base da sua história</small></span><span className="art-check">✓</span></div>
            <div className="art-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <span className="art-card-caption">UMA HISTÓRIA COM A SUA VOZ</span>
          </div>
          <div className="art-orbit-dot dot-one" />
          <div className="art-orbit-dot dot-two" />
        </div>
      </section>

      <section className="home-process" aria-labelledby="process-title">
        <div className="process-heading">
          <div>
            <span className="eyebrow">Simples assim</span>
            <h2 id="process-title">Da sua ideia à primeira versão.</h2>
          </div>
          <p>Você traz o que importa. A gente organiza as palavras.</p>
        </div>
        <ol className="home-steps">
          {steps.map((step) => (
            <li className="home-step" key={step.number}>
              <div className="step-top"><span className="step-icon" aria-hidden="true">{step.icon}</span><span className="step-number">{step.number}</span></div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-bottom-cta" aria-label="Começar a criar">
        <div><span className="eyebrow">Sua próxima história está esperando</span><h2>Vamos tirar essa ideia do papel?</h2></div>
        <Link className="secondary-button" to={createPath}>Começar agora <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}

export default Home;
