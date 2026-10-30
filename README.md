# ScriptAI — frontend

Frontend React para criar, acompanhar e gerenciar roteiros gerados pela API Laravel do projeto `HenriqueBossle/ai-proj-script-api`.

O usuário fornece o tema, os fatos de referência e o estilo desejado. A geração é assíncrona; o frontend consulta o roteiro até que o processamento termine. O conteúdo gerado é exibido como texto, sem renderização HTML.

## Stack e comandos

- React 19 e React Router 7
- Vite 8
- Axios

Instale as dependências e inicie o ambiente de desenvolvimento:

```bash
npm install
npm run dev
```

Scripts disponíveis em `package.json`:

| Comando | Finalidade |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | Build de produção |
| `npm run preview` | Servir localmente o build |
| `npm run lint` | Executar ESLint |

O projeto não possui um script de testes automatizados configurado. Use uma versão do Node.js suportada pelo Vite instalado (Node 20.19+ ou 22.12+).

## Configuração da API

Defina `VITE_API_URL` no arquivo `.env` local, incluindo o prefixo `/api`.

O frontend usa essa URL como base para as chamadas da API. O cliente em [`src/api/api.js`](./src/api/api.js) inclui o token Bearer quando existe sessão e configura credenciais/XSRF; login e cadastro inicializam o cookie CSRF do Sanctum antes da requisição. Não coloque tokens, senhas ou chaves privadas em variáveis `VITE_*`, pois elas são incorporadas ao código enviado ao navegador.

O arquivo `.env` é ignorado pelo Git. Não existe atualmente um `.env.example` no repositório.

## Rotas da aplicação

| Rota | Acesso | Tela |
|---|---|---|
| `/` | Público | Página inicial |
| `/login` | Público | Login |
| `/register` | Público | Cadastro |
| `/create` | Token local necessário | Criar roteiro |
| `/showAll` | Token local necessário | Listar e excluir roteiros |
| `/show/:scriptId` | Token local necessário | Ver, acompanhar e revisar roteiro |
| `/edit/:scriptId` | Token local necessário | Editar dados e solicitar nova geração |

A proteção no navegador verifica a existência do token em `localStorage`; a autorização efetiva é responsabilidade da API.

## Fluxos disponíveis

- Cadastro e login enviam `device_name: "react_app"` e guardam o token e os dados básicos do usuário no `localStorage`.
- A criação envia `topic`, `source_text` e `style_text` para `POST /scripts`.
- A listagem consulta `GET /scripts`; a visualização consulta `GET /scripts/{script}`.
- A edição carrega o roteiro e envia os campos para `PUT /scripts/{script}`. A API recoloca o roteiro em processamento para gerar uma nova versão.
- A visualização atualiza roteiros `pending` ou `processing` consultando a API a cada três segundos. A consulta é cancelada ao sair da tela.
- Para um roteiro com conteúdo, a revisão contextual envia `instruction` a `POST /scripts/{script}/revise`; a interface acompanha a revisão e mantém o conteúdo anterior enquanto ela é processada.
- A exclusão usa `DELETE /scripts/{script}` e pede confirmação por `window.confirm`.

Os status apresentados pela interface são `pending`, `processing`, `done` e `failed`. Consulte as rotas e validações da API antes de alterar payloads ou regras.

## Estrutura principal

```text
src/
├── api/api.js                 # Cliente Axios usado pelas páginas e pelo contexto
├── components/                # Navbar e Footer
├── context/AuthContext.jsx    # Sessão, login, cadastro e logout
├── pages/                     # Home, autenticação e roteiros
├── routes/                    # Rotas públicas e proteção por token
├── services/api.js            # Segundo cliente Axios atualmente sem uso nas páginas
├── index.css                  # Estilos da aplicação
└── App.css                    # Estilos remanescentes do template Vite
```

Há dois módulos Axios no código. As páginas e o contexto de autenticação importam `src/api/api.js`; `src/services/api.js` é uma implementação duplicada atualmente não utilizada.

## Verificações

Execute `npm run lint` e `npm run build` antes de enviar mudanças. Não há testes automatizados configurados no `package.json`; registre qualquer limitação ou falha encontrada ao validar.
