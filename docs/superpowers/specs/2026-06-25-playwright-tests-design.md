# Design: Testes E2E com Playwright — Painel Admin

**Data:** 2026-06-25
**Escopo:** CRUD completo de Clientes, Agendamentos e Usuários via interface gráfica
**Ferramenta:** Playwright com mocking de rede (sem banco real)

---

## 1. Contexto

O painel admin (`admin/`) é uma SPA React + Vite que usa Supabase como backend. Os testes devem validar o comportamento da interface — formulários, navegação, mensagens de erro, dialogs — sem depender de um banco de dados real. As chamadas ao Supabase são interceptadas no nível de rede pelo Playwright.

---

## 2. Estrutura de Arquivos

```
admin/
  playwright.config.js       ← configuração principal
  e2e/
    fixtures/
      auth.js                ← injeta sessão de admin fake no localStorage
      routes.js              ← helpers para mockar endpoints REST e Auth do Supabase
    login.spec.js
    clientes.spec.js
    agendamentos.spec.js
    usuarios.spec.js
```

Os testes são adicionados ao `admin/` (mesmo pacote), com Playwright instalado como `devDependency`. O script `npm run test:e2e` sobe o servidor Vite em modo preview e roda os testes.

---

## 3. Estratégia de Mock

O `@supabase/supabase-js` faz requisições HTTP para dois domínios:

- **Auth:** `https://<projeto>.supabase.co/auth/v1/*`
- **REST:** `https://<projeto>.supabase.co/rest/v1/*`

O Playwright intercepta esses requests via `page.route(pattern, handler)`. Cada teste define exatamente quais respostas quer receber.

### `fixtures/auth.js`

Antes de cada teste que exige autenticação, injeta no `localStorage` um objeto de sessão falso (access_token + user com `role: admin`). Isso evita passar pela tela de login em todos os testes que não estão testando o login em si.

```js
// exemplo de uso nos testes
test.beforeEach(async ({ page }) => {
  await injectAdminSession(page)
  await page.goto('/admin/')
})
```

### `fixtures/routes.js`

Exporta funções auxiliares para mockar os endpoints mais usados:

```js
mockGetClientes(page, data)      // GET /rest/v1/clientes
mockInsertCliente(page)          // POST /rest/v1/clientes → 201
mockUpdateCliente(page)          // PATCH /rest/v1/clientes → 200
mockDeleteCliente(page)          // DELETE /rest/v1/clientes → 204
mockGetAgendamentos(page, data)  // GET /rest/v1/agendamentos
// etc.
```

---

## 4. Configuração do Playwright

**`admin/playwright.config.js`**

```js
export default {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
}
```

O `webServer` sobe automaticamente o Vite dev server antes de rodar os testes.

---

## 5. Casos de Teste

### `login.spec.js`

| # | Caso | Ação | Resultado esperado |
|---|------|------|--------------------|
| 1 | Happy path | Email + senha válidos (mock auth retorna sessão) | Redireciona para `/admin/` |
| 2 | Credenciais inválidas | Mock auth retorna 400 | Exibe "Email ou senha incorretos." |
| 3 | Campos vazios | Submeter form sem preencher | Form não envia (validação HTML) |

---

### `clientes.spec.js`

Todos os testes usam sessão de admin injetada via `auth.js`.

| # | Caso | Ação | Resultado esperado |
|---|------|------|--------------------|
| 1 | Listar clientes | Navegar para `/admin/clientes` | Lista renderiza com dados do mock |
| 2 | Criar cliente | Preencher nome + telefone, salvar | Redireciona para `/admin/clientes` |
| 3 | Criar sem nome | Submeter form sem nome | Form não envia (campo obrigatório) |
| 4 | Editar cliente | Abrir cliente, alterar nome, salvar | Redireciona para `/admin/clientes` |
| 5 | Deletar cliente | Clicar "Deletar", confirmar dialog | Item some da lista |
| 6 | Cancelar deleção | Clicar "Deletar", cancelar dialog | Lista permanece igual |
| 7 | Busca por nome | Digitar no campo de busca | Lista filtra client-side |
| 8 | Busca por telefone | Digitar número no campo de busca | Lista filtra client-side |
| 9 | Adicionar gato | Na edição, preencher nome do gato, clicar + | Gato aparece na lista |
| 10 | Remover gato | Clicar "Remover" no gato | Gato some da lista |

---

### `agendamentos.spec.js`

| # | Caso | Ação | Resultado esperado |
|---|------|------|--------------------|
| 1 | Listar agendamentos | Navegar para `/admin/agendamentos` | Lista renderiza com dados do mock |
| 2 | Criar agendamento | Selecionar cliente, data, status, sitter, salvar | Redireciona para `/admin/agendamentos` |
| 3 | Editar agendamento | Abrir agendamento, mudar status, salvar | Redireciona para `/admin/agendamentos` |
| 4 | Filtrar por status | Selecionar status no dropdown | Lista filtra client-side |
| 5 | Filtrar por data | Selecionar data | Lista filtra client-side |
| 6 | Limpar filtros | Clicar "Limpar filtros" | Todos os agendamentos reaparecem |
| 7 | Cat sitter vê leitura | Sessão injetada como `role: catsitter`, abrir agendamento | Campos desabilitados, botão "Salvar" ausente, apenas "← Voltar" |

---

### `usuarios.spec.js`

O invite é feito via Edge Function (`VITE_SUPABASE_FUNCTION_CREATE_USER`), não via REST do Supabase. O mock intercepta esse endpoint via `page.route()`. O formulário só aparece após clicar em "+ Nova Cat Sitter".

| # | Caso | Ação | Resultado esperado |
|---|------|------|--------------------|
| 1 | Listar usuários | Navegar para `/admin/usuarios` | Lista renderiza com dados do mock (`/rest/v1/profiles`) |
| 2 | Abrir formulário | Clicar "+ Nova Cat Sitter" | Formulário aparece com campos Nome, Email, Função |
| 3 | Convidar usuário | Preencher nome + email + função, clicar "Enviar convite" (mock Edge Function retorna 200) | Exibe "Convite enviado para {email}!" |
| 4 | Campos obrigatórios | Submeter form sem nome ou sem email | Form não envia |
| 5 | Erro no invite | Mock Edge Function retorna erro 500 | Exibe mensagem de erro |
| 6 | Cancelar formulário | Clicar "Cancelar" no form | Formulário some, lista permanece visível |

---

## 6. Scripts npm

Adicionar ao `admin/package.json`:

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

- `npm run test:e2e` — roda todos os testes headless
- `npm run test:e2e:ui` — abre interface visual do Playwright (útil para depurar)

---

## 7. Dependências a Instalar

```bash
cd admin && npm install -D @playwright/test
npx playwright install chromium
```

Apenas o Chromium é necessário para testes de interface.

---

## 8. O Que Não Está Incluído

- Testes de stress/carga (fora do escopo)
- Testes contra Supabase real (fora do escopo)
- Testes unitários de componentes (fora do escopo)
- Testes em Firefox/Safari (pode ser adicionado depois)
