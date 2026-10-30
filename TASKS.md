# TASKS.md — frontend ScriptAI

Este backlog descreve o estado observado no frontend e os próximos trabalhos. Os itens concluídos refletem o código atual; não representam uma certificação de ponta a ponta com a API em execução.

## Já implementado

### Base e autenticação

- [x] Aplicação React/Vite com React Router, `AuthProvider`, navbar e páginas públicas.
- [x] Login e cadastro com inicialização de cookie CSRF do Sanctum.
- [x] Envio de `device_name: "react_app"` nos pedidos de login e cadastro.
- [x] Armazenamento local do token e dos dados básicos do usuário.
- [x] Consulta a `GET /user` ao iniciar com token existente.
- [x] Logout que remove o estado local mesmo quando a chamada remota falha.
- [x] Proteção das rotas de roteiro pela presença de token no `localStorage`.

### Roteiros

- [x] Criar roteiro em `POST /scripts` com `topic`, `source_text` e `style_text`.
- [x] Listar roteiros em `GET /scripts`, com estado vazio e nova tentativa após erro.
- [x] Consultar um roteiro em `GET /scripts/{script}` e exibir `generated_content`.
- [x] Exibir os estados `pending`, `processing`, `done` e `failed`, com fallback para status desconhecido.
- [x] Consultar a API a cada três segundos enquanto o roteiro está em processamento; abortar consultas ao sair da página.
- [x] Editar dados em `PUT /scripts/{script}` e solicitar nova geração.
- [x] Excluir em `DELETE /scripts/{script}` após confirmação por `window.confirm`.
- [x] Solicitar revisão contextual em `POST /scripts/{script}/revise` e acompanhar o resultado sem substituir o conteúdo anterior durante o processamento.

### Interface

- [x] Página inicial com chamadas para cadastro/login e navegação baseada na sessão.
- [x] Labels, mensagens de carregamento/erro e layout responsivo nas telas principais.
- [x] Exibição do conteúdo gerado como texto, sem HTML injetado.

## Pendências

### Autenticação e sessão — prioridade alta

- [ ] Diferenciar `401` de falha de rede ao restaurar sessão; atualmente qualquer falha em `GET /user` remove os dados locais.
- [ ] Centralizar ou padronizar o tratamento de `401` para limpar a sessão inválida e encaminhar o usuário ao login, evitando redirecionamentos repetidos.
- [ ] Fazer a rota protegida considerar o estado `loading` do contexto, em vez de decidir somente pela presença imediata do token.
- [ ] Revisar o estado de autenticação consumido pela navbar, que atualmente lê o token diretamente do `localStorage`.

### Formulários e erros — prioridade alta

- [ ] No formulário de criação, substituir `alert()` e o log do erro por mensagens acessíveis na página e tratar erros de validação `422`.
- [ ] Alinhar a obrigatoriedade de `style_text`: a API permite valor nulo, mas criação e edição no frontend marcam o campo como obrigatório.
- [ ] Aplicar na interface os limites da API: `topic` até 255 caracteres, `source_text` e `style_text` até 20.000 caracteres.
- [ ] Associar mensagens de validação a cada campo também no cadastro e login, preservando os valores digitados quando houver erro recuperável.
- [ ] Revisar a diferenciação de falhas de rede, `401`, `403`, `404`, `409`, `422`, `429`, `503` e `5xx` nas telas que fazem requisições.

### Estrutura HTTP — prioridade média

- [ ] Resolver a duplicidade dos clientes Axios: páginas e contexto usam `src/api/api.js`, enquanto `src/services/api.js` contém outro cliente sem uso atual.
- [ ] Ao consolidar clientes, preservar a base `VITE_API_URL`, o Bearer token e o fluxo CSRF/XSRF de Sanctum.

### Validação e manutenção — prioridade média

- [ ] Adicionar testes para autenticação, proteção de rotas, operações CRUD, polling, revisão e principais respostas de erro.
- [ ] Validar os fluxos com o backend em execução; o repositório não possui atualmente script de testes automatizados.
- [ ] Rever os estilos/arquivos remanescentes do template Vite (`src/App.css` e assets do template) antes de removê-los, verificando imports e uso.

## Contrato usado pelo frontend

As rotas correspondem às declaradas em `../ai-proj-script-api/routes/api.php`: autenticação (`/register`, `/login`, `/user`, `/logout`) e recursos protegidos de `/scripts`, incluindo `POST /scripts/{script}/revise`.

O backend valida `topic` como obrigatório com até 255 caracteres; `source_text` como obrigatório com até 20.000; `style_text` como opcional/nulo com até 20.000; e `instruction` de revisão como obrigatório com até 600. Confirme novamente o contrato no código do backend antes de alterar essas informações.

## Comandos disponíveis

Conforme `package.json`:

```bash
npm run lint
npm run build
```

Também existem `npm run dev` e `npm run preview`. Não há comando `test` configurado no momento. Ao concluir uma tarefa, registre no resumo quais verificações foram realmente executadas e se houve falhas.
