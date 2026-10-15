# TASKS.md — AI Script Generator Frontend

## 1. Objetivo

Este documento organiza o desenvolvimento e a validação do frontend React do AI Script Generator, seguindo as regras do AGENTS.md e o contrato da API Laravel.

O foco do MVP é permitir:

- cadastro e login de usuários;
- autenticação com token Bearer;
- listagem, criação, visualização, edição e exclusão de roteiros;
- acompanhamento do processamento assíncrono;
- tratamento de erros e estados de carregamento.

---

## 2. Estado atual do projeto

Com base na estrutura atual do repositório, o frontend já possui:

- configuração base do React + Vite;
- cliente HTTP centralizado em `src/services/api.js`;
- contexto de autenticação em `src/context/AuthContext.jsx`;
- rotas e proteção de páginas em `src/routes/`;
- páginas de autenticação e de roteiros já estruturadas;
- dependências principais do projeto já instaladas (`react`, `react-router-dom`, `axios`).

Ainda é necessário confirmar o comportamento real da API e completar/validar os fluxos do MVP conforme o contrato do backend.

---

## 3. Backlog de tarefas

### Fase 1 — Base de autenticação e sessão

- [ ] Confirmar a URL da API via variável de ambiente `VITE_API_URL`.
- [ ] Centralizar requisições e autenticação no serviço HTTP.
- [ ] Validar o fluxo de login com `email`, `password` e `device_name`.
- [ ] Validar o fluxo de cadastro com `name`, `email`, `password`, `password_confirmation` e `device_name`.
- [ ] Garantir que o token seja salvo e recuperado de forma consistente.
- [ ] Tratar `401 Unauthorized` limpando a sessão inválida e redirecionando para login.
- [ ] Evitar loops de redirecionamento ao falhar autenticação.
- [ ] Implementar logout limpando local state mesmo quando a API falhar.
- [ ] Manter estado de autenticação consistente entre páginas.

### Fase 2 — Gerenciamento de roteiros

- [ ] Listar roteiros do usuário autenticado em `GET /scripts`.
- [ ] Exibir estado vazio quando não houver roteiros.
- [ ] Criar roteiro com `topic`, `source_text` e `style_text`.
- [ ] Validar campos obrigatórios e erros do backend (`422`).
- [ ] Exibir carregamento e desabilitar botão durante o envio.
- [ ] Evitar requisições duplicadas ao criar ou editar um roteiro.
- [ ] Consultar um roteiro específico em `GET /scripts/{script}`.
- [ ] Exibir o conteúdo gerado em `generated_content` quando o status for `done`.
- [ ] Atualizar roteiro com reprocessamento quando necessário.
- [ ] Excluir roteiro com confirmação antes da ação.

### Fase 3 — Geração assíncrona e polling

- [ ] Tratar corretamente os estados: `pending`, `processing`, `done` e `failed`.
- [ ] Exibir indicador visual para roteiros em processamento.
- [ ] Informar ao usuário que a geração está em andamento.
- [ ] Polling ou consulta por estado compatível com o backend, sem execução concorrente duplicada.
- [ ] Interromper polling quando o status chegar a `done` ou `failed`.
- [ ] Cancelar consultas ao desmontar o componente ou sair da página.
- [ ] Tratar falhas temporárias sem criar ciclos infinitos.
- [ ] Exibir mensagem segura para falhas de geração e usar `error_message` apenas quando apropriado.
- [ ] Fallback seguro para estados desconhecidos retornados pela API.

### Fase 4 — UX, acessibilidade e validação

- [ ] Preservar valores preenchidos após erro recuperável.
- [ ] Exibir mensagens de erro próximas aos campos relevantes.
- [ ] Diferenciar erros de validação, autenticação, rede e servidor.
- [ ] Aplicar labels acessíveis e foco visível nos formulários.
- [ ] Manter consistência visual e textos em português brasileiro.
- [ ] Garantir responsividade para desktop e mobile.
- [ ] Usar HTML semântico e evitar `alert()` como solução padrão.
- [ ] Apresentar estados de carregamento, sucesso, vazio e erro.

### Fase 5 — Tratamento de erros HTTP

- [ ] Tratar `401` como sessão inválida e solicitar login.
- [ ] Tratar `403` como operação não permitida.
- [ ] Tratar `404` de recurso ausente ou inacessível.
- [ ] Apresentar erros de validação para `422`.
- [ ] Informar limite de requisições para `429` quando aplicável.
- [ ] Apresentar erro de servidor para `5xx`.
- [ ] Informar falhas de rede/CORS sem expor detalhes internos.

### Fase 6 — Testes e validação final

- [ ] Executar lint, caso configurado.
- [ ] Executar build de produção.
- [ ] Validar rotas protegidas e públicas.
- [ ] Testar cadastro e login bem-sucedidos.
- [ ] Testar credenciais inválidas.
- [ ] Validar listagem vazia e com roteiros.
- [ ] Validar criação e acompanhamento da geração.
- [ ] Validar geração concluída e falha na geração.
- [ ] Validar edição e regeneração.
- [ ] Validar exclusão de roteiros.
- [ ] Revisar logs temporários e código não utilizado.
- [ ] Confirmar que não há URLs fixas de API espalhadas no código.

---

## 4. Critérios de conclusão

Uma tarefa só pode ser considerada concluída quando:

- o comportamento respeitar o contrato real da API;
- a autenticação e as rotas protegidas estiverem consistentes;
- os estados de carregamento, sucesso, vazio e erro forem tratados;
- o código respeitar as convenções do projeto;
- a aplicação continuar responsiva e acessível;
- os testes e verificações aplicáveis forem executados e registrados.

---

## 5. Checklist de verificação antes de fechar uma tarefa

- [ ] Releitura do AGENTS.md e README.
- [ ] Consulta ao contrato da API do backend.
- [ ] Verificação das rotas e componentes impactados.
- [ ] Validação de lint/build quando disponível.
- [ ] Revisão do diff para remover código temporário.
- [ ] Registro claro do que foi implementado e do que foi validado.

---

## 6. Prioridade sugerida

### Prioridade alta

1. autenticação e sessão;
2. listagem e criação de roteiros;
3. visualização e processamento assíncrono;
4. gestão de edição/exclusão.

### Prioridade média

5. validações e mensagens de erro;
6. tratamento de 401/403/404/422/429/5xx;
7. acessibilidade e UX refinada.

### Prioridade baixa

8. revisão e refinamento final;
9. build, lint e QA geral.
