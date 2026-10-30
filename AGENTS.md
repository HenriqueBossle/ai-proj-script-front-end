# AGENTS.md — frontend ScriptAI

## Contexto do projeto

Este repositório contém o frontend React/Vite do ScriptAI e consome a API Laravel disponível no repositório irmão `../ai-proj-script-api`. A API é a fonte de verdade para autenticação, autorização, validação, persistência e geração.

O frontend atualmente oferece página inicial, cadastro, login, criação e listagem de roteiros, visualização com acompanhamento do processamento, edição, exclusão e revisão contextual de um roteiro gerado.

## Estado e estrutura observados no código

- React 19, React Router 7, Vite 8 e Axios; consulte `package.json` antes de alterar dependências.
- A aplicação inicializa `BrowserRouter` e `AuthProvider` em `src/main.jsx`.
- As rotas ficam em `src/routes/AppRoutes.jsx`; `src/routes/ProtectedRoutes.jsx` protege páginas verificando se há token no `localStorage`.
- `src/context/AuthContext.jsx` implementa recuperação da sessão, login, cadastro e logout.
- As páginas e o contexto importam `src/api/api.js`. Esse cliente lê `VITE_API_URL`, envia token Bearer e configura credenciais/XSRF. Login e cadastro inicializam o cookie CSRF do Sanctum.
- `src/services/api.js` contém outro cliente Axios com sobreposição funcional e não é importado pelas páginas atuais. Não amplie essa duplicação; confirme os imports antes de removê-lo ou consolidá-lo.
- `src/index.css` concentra os estilos da interface. `src/App.css` ainda contém estilos remanescentes do template Vite.
- Não há suíte de testes automatizados nem script de teste definido em `package.json`; os comandos configurados são `dev`, `build`, `preview` e `lint`.

## Regras para mudanças

1. Leia este arquivo, `README.md` e `TASKS.md` antes de implementar.
2. Inspecione o código atual e os scripts do `package.json`; não assuma que um item de backlog já foi implementado.
3. Antes de mudar chamadas, payloads, validações ou estados de roteiro, confira o contrato atual no backend, especialmente `routes/api.php`, Form Requests, controllers e resources.
4. Reutilize a estrutura e os componentes existentes. Preserve React, React Router, Axios e o sistema de estilos atual, salvo solicitação explícita.
5. Não invente endpoints, campos, estados ou regras. Não modifique o backend a partir deste repositório.
6. Preserve o escopo do MVP, salvo solicitação explícita.
7. Em documentação, diferencie comportamento implementado de comportamento desejado ou pendente. Mantenha o backlog alinhado ao código.
8. Execute as verificações disponíveis e informe os comandos e resultados reais.

## API e autenticação

Configure `VITE_API_URL` com a URL base da API, incluindo o prefixo configurado pelo backend (normalmente `/api`). Não fixe hosts de produção no código. Variáveis `VITE_*` são públicas no bundle: nunca use-as para segredos, tokens privados ou chaves de IA.

O cliente ativo, `src/api/api.js`, envia `Accept: application/json`, credenciais/XSRF e o token Bearer encontrado em `localStorage`. O contexto solicita o cookie `/sanctum/csrf-cookie` antes de login e cadastro. O token e os dados básicos do usuário são guardados no `localStorage`; senhas não devem ser persistidas.

Endpoints atualmente declarados em `../ai-proj-script-api/routes/api.php`:

| Método | Endpoint | Uso no frontend |
|---|---|---|
| `POST` | `/register` | Cadastro |
| `POST` | `/login` | Login |
| `GET` | `/user` | Verificação da sessão no início da aplicação |
| `POST` | `/logout` | Logout |
| `GET` | `/scripts` | Listagem |
| `POST` | `/scripts` | Criação |
| `GET` | `/scripts/{script}` | Leitura e polling |
| `PUT` | `/scripts/{script}` | Atualização dos dados e nova geração |
| `DELETE` | `/scripts/{script}` | Exclusão |
| `POST` | `/scripts/{script}/revise` | Revisão contextual |

O login exige `email`, `password` e `device_name`; o cadastro exige `name`, `email`, `password`, `password_confirmation` e `device_name`. O frontend usa `device_name: "react_app"`.

Criação e atualização usam `topic`, `source_text` e `style_text`. No backend consultado, `topic` é obrigatório e limitado a 255 caracteres, `source_text` é obrigatório e limitado a 20.000 caracteres, e `style_text` é opcional/nulo e limitado a 20.000 caracteres. A interface atualmente marca os três campos como obrigatórios e não aplica todos esses limites; considere isso ao revisar formulários. Revisão usa `instruction`, obrigatória e limitada a 600 caracteres.

O recurso de roteiro expõe `id`, `user_id`, `topic`, `source_text`, `style_text`, `generated_content`, `status`, `error_message`, `created_at` e `updated_at`. Não envie `user_id` para definir propriedade e não renderize conteúdo não confiável como HTML.

## Comportamentos atuais e limites conhecidos

- A tela de roteiro consulta novamente o recurso a cada três segundos enquanto o status é `pending` ou `processing`, e cancela chamadas ao desmontar. Não transforme isso em polling concorrente.
- A API usa os estados `pending`, `processing`, `done` e `failed`. Preserve os estados e ofereça fallback seguro para valores desconhecidos.
- A edição solicita nova geração; a revisão contextual é uma ação separada que preserva a versão anterior enquanto a API processa a nova.
- A listagem confirma exclusões usando `window.confirm`.
- A criação atualmente apresenta falha por `alert()` e registra o erro no console; login, cadastro, edição, listagem e visualização apresentam mensagens na interface em seus fluxos atuais.
- Não existe interceptor global para limpar e redirecionar em qualquer resposta `401`. A checagem inicial do contexto remove dados locais se `/user` falhar, enquanto as telas tratam erros HTTP localmente. Não documente um redirecionamento global como comportamento existente.
- A proteção de rotas no cliente apenas verifica a presença do token; autorização real sempre deve permanecer na API.

Esses limites são observações do código atual, não garantias desejadas. Mudanças que os resolvam devem manter tratamento explícito de erro, preservar os dados recuperáveis e atualizar `TASKS.md`/`README.md` conforme necessário.

## Segurança, conteúdo e interface

- Nunca versione `.env` com valores reais. O `.env` local é ignorado pelo Git; atualmente não há `.env.example`.
- Não exponha chaves de IA ou outras credenciais no frontend.
- Não registre tokens, senhas ou conteúdo sensível em logs.
- Use a API para autorização; não confie em IDs, ocultação de botões ou estado local como controle de acesso.
- Exiba `generated_content` como texto simples, salvo requisito explícito acompanhado de sanitização apropriada.
- Mantenha os campos distintos: `topic` descreve tema/objetivo, `source_text` é a fonte factual e `style_text` orienta a forma de escrever.
- Não acrescente pesquisa externa, scraping ou novas fontes factuais sem solicitação explícita.
- Preserve português brasileiro, responsividade, HTML semântico, labels, foco visível e mensagens associadas aos campos.
- Não invente limites de validação: confira os Form Requests no backend. A validação da interface melhora a experiência, mas a API permanece autoritativa.

## Validação

Confira `package.json` antes de executar comandos. No estado atual, estão disponíveis:

```bash
npm run lint
npm run build
```

Não há testes automatizados configurados. Execute verificações direcionadas para o código alterado e relate falhas pré-existentes separadamente; não declare testes não executados.
