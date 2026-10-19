# AGENTS.md — AI Script Generator Frontend

## 1. Visão geral

Este repositório contém o frontend React do **AI Script Generator**, uma aplicação para criar, gerar e gerenciar roteiros de vídeos com inteligência artificial.

O frontend consome a API Laravel do repositório `HenriqueBossle/ai-proj-script-api`.

A API é a fonte da verdade para autenticação, autorização, validação, persistência e processamento dos roteiros.

### Funcionalidades principais

- Cadastro e login de usuários.
- Listagem dos roteiros do usuário autenticado.
- Criação de roteiros com assunto, fonte factual e referência de estilo.
- Acompanhamento da geração assíncrona.
- Visualização do conteúdo gerado.
- Edição e regeneração de roteiros.
- Exclusão de roteiros.
- Logout.

## 2. Regras obrigatórias para os agentes

Antes de implementar qualquer funcionalidade:

1. Leia este arquivo e o `README.md`.
2. Leia o `TASKS.md` do frontend, caso exista.
3. Inspecione a estrutura atual do projeto e o `package.json`.
4. Consulte o `AGENTS.md` e o `TASKS.md` do backend para compreender as regras de negócio e o contrato da API.
5. Reutilize os componentes, serviços, hooks e contextos existentes.
6. Não invente endpoints, campos de resposta ou regras de negócio.
7. Não altere o backend a partir deste repositório.
8. Não implemente funcionalidades fora do MVP sem solicitação explícita.
9. Execute as verificações disponíveis antes de concluir uma tarefa.
10. Informe claramente o que foi implementado e quais testes foram executados.

Preserve os padrões existentes sempre que forem adequados. Evite refatorações amplas sem necessidade.

## 3. Tecnologias e ferramentas

O frontend utiliza React. Antes de modificar a stack, confira as dependências instaladas.

- Preserve a versão atual do React.
- Mantenha o roteador já utilizado pelo projeto.
- Utilize o cliente HTTP existente, como Axios, se já estiver configurado.
- Preserve o sistema de estilos existente.
- Não adicione dependências sem necessidade justificada.
- Não migre JavaScript para TypeScript, ou vice-versa, sem solicitação.
- Se o projeto utilizar Vite, mantenha sua configuração atual.

Confira os scripts disponíveis no `package.json` antes de executar comandos como:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Não presuma que todos esses scripts existem.

## 4. Organização do código

Respeite a estrutura existente. Se for necessário estabelecer uma organização, prefira:

```text
src/
├── assets/
├── components/
├── contexts/
├── hooks/
├── pages/
├── routes/
├── services/
└── utils/
```

Responsabilidades:

- `components/`: componentes reutilizáveis.
- `contexts/`: estado global compartilhado, como autenticação.
- `hooks/`: lógica reutilizável de React.
- `pages/`: páginas da aplicação.
- `routes/`: definição e proteção das rotas.
- `services/`: cliente HTTP e comunicação com a API.
- `utils/`: funções auxiliares reutilizáveis.

Não crie arquivos ou pastas desnecessários. Siga as convenções já adotadas pelo projeto.

## 5. Configuração da API

A URL base da API deve ser configurável por variável de ambiente.

Para projetos Vite, utilize a convenção existente ou, se ainda não houver uma, considere:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Regras:

- Centralize a configuração da URL em um único serviço.
- Não espalhe URLs da API pelos componentes.
- Evite duplicar o segmento `/api` nos endpoints.
- Não fixe a URL de produção diretamente no código.
- Configure corretamente a URL no ambiente de produção.
- Nunca exponha credenciais privadas ou chaves de IA em variáveis `VITE_*`.

As variáveis `VITE_*` são disponibilizadas no código executado pelo navegador.

## 6. Autenticação com Laravel Sanctum

A API disponibiliza os seguintes endpoints de autenticação:

| Método |  Endpoint   |      Finalidade     |
|--------|-------------|---------------------|
|  POST  | `/register` |  Cadastrar usuário  |
|  POST  |  `/login`   |  Autenticar usuário |
|  POST  |  `/logout`  |   Encerrar sessão   |

Os endpoints são relativos à URL base configurada.

O login utiliza:

- `email`
- `password`
- `device_name`

O cadastro utiliza:

- `name`
- `email`
- `password`
- `password_confirmation`
- `device_name`

As rotas protegidas utilizam o token Bearer retornado pela API:

```http
Authorization: Bearer <token>
Accept: application/json
```

### Regras de autenticação

- Centralize o envio do token no serviço HTTP.
- Envie `device_name` conforme o contrato do backend.
- Não armazene senhas no navegador.
- Nunca registre tokens ou senhas no console.
- Trate erros de autenticação e falhas de rede separadamente.
- Ao receber `401 Unauthorized`, limpe a sessão inválida e redirecione para o login.
- Evite loops de redirecionamento quando a autenticação falhar.
- No logout, limpe o estado local mesmo se a chamada à API falhar.
- Mantenha o estado de autenticação consistente entre páginas.

Se o projeto utilizar `localStorage` para armazenar o token, mantenha esse mecanismo consistente, considerando os riscos de segurança. Não migre silenciosamente para autenticação por cookies sem verificar o suporte do backend.

A proteção de rotas no React melhora a navegação, mas não substitui a autorização realizada pela API.

## 7. Gerenciamento de roteiros

Os endpoints de roteiros são protegidos por autenticação.

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/scripts` | Listar roteiros |
| POST | `/scripts` | Criar roteiro e solicitar geração |
| GET | `/scripts/{script}` | Consultar roteiro |
| PUT/PATCH | `/scripts/{script}` | Atualizar roteiro e solicitar nova geração |
| DELETE | `/scripts/{script}` | Excluir roteiro |

Confirme os métodos, os campos e os formatos de resposta no código real do backend antes de implementar ou modificar as requisições.

### Campos de entrada

A criação de um roteiro utiliza os seguintes campos:

- `topic`: assunto e objetivo do vídeo.
- `source_text`: texto com os fatos autorizados.
- `style_text`: referência de estilo de escrita.

Exemplo de payload:

```json
{
  "topic": "Assunto do vídeo",
  "source_text": "Texto com os fatos autorizados",
  "style_text": "Referência de estilo"
}
```

A obrigatoriedade dos campos deve seguir as validações reais da API.

### Campos do roteiro

Os campos relevantes incluem:

- `id`
- `user_id`
- `topic`
- `source_text`
- `style_text`
- `generated_content`
- `status`
- `error_message`
- `created_at`
- `updated_at`

Utilize `generated_content` para acessar o conteúdo gerado, conforme o contrato atual. Não substitua esse nome por `content` ou `generatedContent` sem uma transformação explícita e documentada.

Não envie `user_id` para definir o proprietário do roteiro. A API deve identificar o usuário autenticado pelo token.

## 8. Geração assíncrona

A geração dos roteiros é assíncrona. O frontend não deve presumir que o conteúdo está pronto assim que a API aceita a criação ou atualização.

Estados esperados:

- `pending`: aguardando processamento.
- `processing`: geração em andamento.
- `done`: geração concluída.
- `failed`: geração falhou.

### Comportamento da interface

Para `pending` e `processing`:

- Apresente um indicador de processamento.
- Informe ao usuário que o roteiro está sendo gerado.
- Consulte o estado atualizado pela API usando o mecanismo suportado pelo projeto.

Para `done`:

- Exiba o conteúdo de `generated_content`.
- Apresente o roteiro de forma legível.

Para `failed`:

- Informe que a geração falhou.
- Apresente uma mensagem segura e compreensível.
- Utilize `error_message` apenas quando houver conteúdo adequado para exibição.

### Polling

Se o projeto utilizar polling:

- Evite consultas excessivamente frequentes.
- Não inicie múltiplos ciclos concorrentes para o mesmo roteiro.
- Interrompa as consultas quando o estado for `done` ou `failed`.
- Cancele ou interrompa as consultas quando o componente for desmontado ou o usuário sair da página.
- Trate falhas temporárias sem criar ciclos infinitos.

Não crie novos estados de backend por conta própria. Se a API retornar um estado desconhecido, apresente um fallback seguro.

A edição de `topic`, `source_text` ou `style_text` deve respeitar o comportamento de regeneração definido no backend. Após a atualização, a interface deve refletir o estado real retornado pela API.

## 9. Regras de conteúdo

Os três campos de entrada têm responsabilidades diferentes:

- `topic` define o assunto e o objetivo do roteiro.
- `source_text` contém a fonte factual autorizada.
- `style_text` orienta a forma de escrever, não os fatos.

O frontend deve preservar essa distinção.

Não adicione automaticamente pesquisa na internet, scraping ou outras fontes factuais externas.

Não apresente instruções de estilo como fatos. Não altere silenciosamente o conteúdo enviado pelo usuário.

Utilize rótulos, placeholders e textos auxiliares que expliquem o propósito de cada campo.

## 10. Formulários e validação

- Valide campos no frontend para melhorar a experiência.
- Considere a API como autoridade final de validação.
- Apresente erros de validação próximos aos campos correspondentes.
- Preserve os valores preenchidos quando ocorrer um erro recuperável.
- Desabilite o botão de envio enquanto a requisição estiver em andamento.
- Evite requisições duplicadas.
- Exiba indicadores de carregamento, sucesso e erro.
- Não invente limites de caracteres; consulte as regras do backend.
- Diferencie erros de validação, autenticação, rede e servidor.
- Associe labels e mensagens de erro aos respectivos campos.

## 11. Tratamento de erros HTTP

Trate adequadamente os seguintes cenários:

| Código | Comportamento esperado |
|---|---|
| 401 | Limpar sessão inválida e solicitar login |
| 403 | Informar que a operação não é permitida |
| 404 | Informar que o recurso não foi encontrado ou não está acessível |
| 422 | Apresentar erros de validação |
| 429 | Informar limite de requisições, se aplicável |
| 5xx | Apresentar erro de servidor |
| Erro de rede/CORS | Informar que não foi possível comunicar com a API |

Centralize o tratamento comum no serviço HTTP quando apropriado, sem esconder os erros específicos de cada funcionalidade.

Não interprete toda falha como erro de senha. Não exponha stack traces ou detalhes internos do servidor.

## 12. Interface e acessibilidade

- Mantenha consistência visual entre as páginas.
- Utilize português brasileiro nos textos da interface.
- Garanta funcionamento em dispositivos móveis e desktop.
- Utilize HTML semântico.
- Permita navegação por teclado e mantenha o foco visível.
- Associe labels aos campos de formulário.
- Não comunique estados apenas por cores.
- Utilize nomes claros para botões e ações.
- Solicite confirmação antes de excluir um roteiro.
- Apresente um estado vazio útil quando não houver roteiros.
- Utilize os componentes de diálogo e notificação já existentes.
- Evite `alert()` como solução padrão quando houver alternativas no projeto.

Não utilize dados fictícios para mascarar respostas vazias ou falhas reais da API.

## 13. Segurança

- Não versione arquivos `.env` com credenciais reais.
- Mantenha um `.env.example` sem segredos.
- Nunca exponha chaves privadas de IA no frontend.
- Não confie em IDs enviados pela interface para autorizar acesso.
- Não considere a ocultação de botões como mecanismo de segurança.
- Evite renderizar conteúdo não confiável como HTML.
- Prefira exibir `generated_content` como texto simples, salvo se houver requisito explícito para outro formato e sanitização apropriada.
- Não utilize `dangerouslySetInnerHTML` sem justificativa e proteção adequada.
- Não registre informações sensíveis em logs.
- Respeite as respostas de autorização da API.

## 14. Testes e validação

Antes de concluir uma tarefa:

1. Execute os testes relevantes existentes.
2. Execute o lint, caso esteja configurado.
3. Execute o build de produção.
4. Verifique as rotas afetadas.
5. Teste os estados de carregamento, sucesso, vazio e erro.
6. Confira a autenticação e as requisições protegidas.
7. Verifique se não existem URLs de API indevidamente fixas.
8. Revise o diff e remova logs temporários e código não utilizado.

Quando possível, cubra os seguintes cenários:

- Cadastro e login bem-sucedidos.
- Credenciais inválidas.
- Rotas protegidas sem autenticação.
- Listagem vazia e com roteiros.
- Criação e acompanhamento da geração.
- Geração concluída e geração com falha.
- Edição e regeneração.
- Exclusão de roteiros.
- Erros HTTP 401, 403, 404 e 422.
- Falhas de comunicação com a API.

Não declare que testes foram executados se não foram. Informe verificações que não puderam ser realizadas.

## 15. Fluxo de trabalho dos agentes

Para cada tarefa:

1. Leia as instruções do repositório.
2. Consulte o `TASKS.md` do frontend, se existir.
3. Inspecione os componentes e serviços envolvidos.
4. Confirme o contrato no backend.
5. Identifique a menor alteração que resolve o requisito.
6. Implemente utilizando os padrões existentes.
7. Execute as verificações aplicáveis.
8. Revise as alterações realizadas.
9. Atualize a documentação quando necessário.
10. Informe os arquivos modificados, o resultado e as pendências.

Se a implementação do backend divergir da documentação, investigue o código real e registre a divergência. Não invente comportamentos para contornar a inconsistência.

## 16. Fora do escopo sem autorização

Não implemente por iniciativa própria:

- Funcionalidades de versões futuras.
- Geração de imagens, áudio ou vídeo.
- Integrações externas de pesquisa ou scraping.
- Pagamentos ou assinaturas.
- Papéis administrativos não previstos.
- Notificações em tempo real que exijam infraestrutura nova.
- Troca do provedor ou modelo de IA.
- Migração completa de arquitetura ou bibliotecas.

## 17. Critérios de conclusão

Uma tarefa está concluída quando:

- O requisito solicitado foi implementado.
- O comportamento respeita o contrato real da API.
- A autenticação e a autorização foram consideradas.
- Os estados relevantes de carregamento, sucesso, vazio e erro são tratados.
- A interface continua responsiva e acessível.
- Não foram adicionados segredos ou dados fictícios.
- As verificações aplicáveis foram executadas e relatadas.
- A documentação foi atualizada quando necessário.
