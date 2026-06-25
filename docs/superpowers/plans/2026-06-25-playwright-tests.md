# Playwright E2E Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar e configurar Playwright em `admin/` com testes E2E cobrindo CRUD de Clientes, Agendamentos e Usuários, com mocking de rede para o Supabase.

**Architecture:** Playwright como devDependency em `admin/package.json`. Fixtures em `e2e/fixtures/` isolam a lógica de mock de autenticação (`auth.js`) e de rotas REST (`routes.js`). Cada spec (`login`, `clientes`, `agendamentos`, `usuarios`) importa os fixtures e mocka apenas o que precisa. As chamadas HTTP ao Supabase são interceptadas com `page.route()` — nenhum banco real é tocado.

**Tech Stack:** `@playwright/test`, `dotenv`, Chromium headless, Vite dev server (reutilizado entre testes).

---

## Estrutura de Arquivos

```
admin/
  playwright.config.js           ← CRIAR: configura testDir, baseURL, webServer
  e2e/
    fixtures/
      auth.js                    ← CRIAR: injetaAdminSession / injectCatSitterSession
      routes.js                  ← CRIAR: mockProfiles, mockClientes, mockGatos,
                                           mockAgendamentos, mockInviteUser, mockAuthLogin
    login.spec.js                ← CRIAR: 3 testes de login
    clientes.spec.js             ← CRIAR: 10 testes de CRUD + gatos
    agendamentos.spec.js         ← CRIAR: 7 testes de CRUD + filtros
    usuarios.spec.js             ← CRIAR: 6 testes de convite
  package.json                   ← MODIFICAR: adicionar @playwright/test, dotenv, scripts
```

---

## Task 1: Instalar Playwright e configurar

**Files:**
- Modify: `admin/package.json`
- Create: `admin/playwright.config.js`

- [ ] **Step 1: Adicionar devDependências e scripts ao package.json**

Abrir `admin/package.json` e modificar para incluir:

```json
{
  "name": "admin",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.108.2",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-hook-form": "^7.80.0",
    "react-router-dom": "^7.18.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "autoprefixer": "^10.5.1",
    "dotenv": "^16.0.0",
    "oxlint": "^1.69.0",
    "postcss": "^8.5.15",
    "tailwindcss": "^3.4.19",
    "vite": "^8.1.0"
  }
}
```

- [ ] **Step 2: Criar `admin/playwright.config.js`**

```js
import { defineConfig } from '@playwright/test'
import { config } from 'dotenv'
config()

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    locale: 'pt-BR',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

O `dotenv.config()` carrega `admin/.env` automaticamente quando o teste roda de dentro de `admin/`. Isso disponibiliza `process.env.VITE_SUPABASE_URL` para o fixture de auth.

- [ ] **Step 3: Instalar dependências e browser**

Rodar de dentro de `admin/`:
```bash
npm install
npx playwright install chromium
```

Expected: `@playwright/test` instalado, Chromium baixado.

- [ ] **Step 4: Verificar que Playwright está configurado**

```bash
npm run test:e2e
```

Expected:
```
No test files found matching: e2e/**/*.spec.js
```
(zero testes ainda — isso é correto)

- [ ] **Step 5: Commit**

```bash
git add admin/package.json admin/package-lock.json admin/playwright.config.js
git commit -m "test: setup Playwright E2E no painel admin"
```

---

## Task 2: Fixture de autenticação

**Files:**
- Create: `admin/e2e/fixtures/auth.js`

- [ ] **Step 1: Criar `admin/e2e/fixtures/auth.js`**

```js
export const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001'

const FAKE_SESSION = {
  access_token: 'fake-access-token-test',
  refresh_token: 'fake-refresh-token-test',
  expires_at: 9999999999,
  token_type: 'bearer',
  user: {
    id: FAKE_USER_ID,
    email: 'admin@teste.com',
    aud: 'authenticated',
    role: 'authenticated',
  },
}

function getStorageKey() {
  const url = process.env.VITE_SUPABASE_URL || 'http://localhost'
  const ref = url.replace(/https?:\/\//, '').split('.')[0]
  return `sb-${ref}-auth-token`
}

async function injectSession(page) {
  const key = getStorageKey()
  const value = JSON.stringify(FAKE_SESSION)

  // Injeta a sessão no localStorage antes do React inicializar
  await page.addInitScript(({ k, v }) => {
    localStorage.setItem(k, v)
  }, { k: key, v: value })

  // Intercepta validação do token (supabase-js pode chamar /auth/v1/user)
  await page.route('**/auth/v1/user**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_SESSION.user),
    })
  )
}

/**
 * Injeta sessão de admin. Use com mockProfiles(page) para completar o carregamento do perfil.
 */
export async function injectAdminSession(page) {
  await injectSession(page)
}

/**
 * Injeta sessão de cat sitter. Use com mockProfiles(page, { authProfile: MOCK_CATSITTER_PROFILE }).
 */
export async function injectCatSitterSession(page) {
  await injectSession(page)
}
```

**Nota:** `injectAdminSession` e `injectCatSitterSession` injetam o mesmo token JWT falso — a distinção de papel (role) vem do mock de profiles em `routes.js`. O `addInitScript` roda antes de qualquer JavaScript da página, garantindo que o supabase-js encontra a sessão no localStorage ao inicializar.

- [ ] **Step 2: Commit**

```bash
git add admin/e2e/fixtures/auth.js
git commit -m "test: fixture de injeção de sessão Supabase para testes E2E"
```

---

## Task 3: Fixture de rotas (mock de rede)

**Files:**
- Create: `admin/e2e/fixtures/routes.js`

- [ ] **Step 1: Criar `admin/e2e/fixtures/routes.js`**

```js
import { FAKE_USER_ID } from './auth.js'

// ─── Dados de mock ────────────────────────────────────────────────────────────

export const MOCK_ADMIN_PROFILE = {
  id: FAKE_USER_ID,
  nome: 'Admin Teste',
  role: 'admin',
  first_login: false,
  created_at: '2026-01-01T00:00:00.000Z',
}

export const MOCK_CATSITTER_PROFILE = {
  id: FAKE_USER_ID,
  nome: 'Sitter Teste',
  role: 'catsitter',
  first_login: false,
  created_at: '2026-01-01T00:00:00.000Z',
}

export const MOCK_CLIENTES = [
  { id: 'cliente-1', nome: 'Ana Costa', telefone: '51 99999-0001', endereco: 'Rua A, 1', observacoes: null },
  { id: 'cliente-2', nome: 'Bruno Lima', telefone: '51 99999-0002', endereco: 'Rua B, 2', observacoes: null },
]

export const MOCK_GATOS = [
  { id: 'gato-1', cliente_id: 'cliente-1', nome: 'Whiskers', observacoes: 'Alérgico a peixe' },
]

export const MOCK_NOVO_GATO = {
  id: 'gato-novo', cliente_id: 'cliente-1', nome: 'Mel', observacoes: '',
}

export const MOCK_SITTERS = [
  { id: 'sitter-1', nome: 'Carla Sitter', role: 'catsitter', first_login: false, created_at: '2026-01-01T00:00:00.000Z' },
]

export const MOCK_AGENDAMENTOS = [
  {
    id: 'ag-1',
    data_hora: '2026-07-01T10:00:00.000Z',
    status: 'agendado',
    valor: 150.00,
    clientes: { nome: 'Ana Costa' },
    profiles: { id: 'sitter-1', nome: 'Carla Sitter' },
  },
  {
    id: 'ag-2',
    data_hora: '2026-07-02T14:00:00.000Z',
    status: 'confirmado',
    valor: 200.00,
    clientes: { nome: 'Bruno Lima' },
    profiles: { id: 'sitter-1', nome: 'Carla Sitter' },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(data) }
}

// ─── Mocks de rotas ───────────────────────────────────────────────────────────

/**
 * Mocka a tabela profiles.
 * - Requests com `id=eq.` (carregamento do perfil autenticado) → retorna authProfile
 * - Demais requests (lista de sitters, lista de usuários) → retorna list
 *
 * Sempre chamar após injectAdminSession/injectCatSitterSession.
 */
export async function mockProfiles(page, { authProfile = MOCK_ADMIN_PROFILE, list = MOCK_SITTERS } = {}) {
  await page.route('**/rest/v1/profiles*', route => {
    const url = route.request().url()
    if (url.includes('id=eq.')) return route.fulfill(json([authProfile]))
    return route.fulfill(json(list))
  })
}

/**
 * Mocka CRUD de agendamentos e a query do Dashboard (que também usa /rest/v1/agendamentos).
 */
export async function mockAgendamentos(page, { list = MOCK_AGENDAMENTOS } = {}) {
  await page.route('**/rest/v1/agendamentos*', route => {
    const method = route.request().method()
    const url = route.request().url()
    if (method === 'GET') {
      if (url.includes('id=eq.')) {
        return route.fulfill(json([{
          ...list[0],
          cliente_id: 'cliente-1',
          cat_sitter_id: 'sitter-1',
          endereco_visita: null,
          observacoes: null,
          created_by: FAKE_USER_ID,
        }]))
      }
      return route.fulfill(json(list))
    }
    if (method === 'POST') return route.fulfill(json([list[0]], 201))
    if (method === 'PATCH') return route.fulfill(json([list[0]]))
    return route.continue()
  })
}

/**
 * Mocka CRUD de clientes.
 */
export async function mockClientes(page, { list = MOCK_CLIENTES } = {}) {
  await page.route('**/rest/v1/clientes*', route => {
    const method = route.request().method()
    const url = route.request().url()
    if (method === 'GET') {
      if (url.includes('id=eq.')) return route.fulfill(json([list[0]]))
      return route.fulfill(json(list))
    }
    if (method === 'POST') return route.fulfill(json([list[0]], 201))
    if (method === 'PATCH') return route.fulfill(json([list[0]]))
    if (method === 'DELETE') return route.fulfill({ status: 204 })
    return route.continue()
  })
}

/**
 * Mocka CRUD de gatos (usado no ClienteForm em modo edição).
 * Por padrão retorna MOCK_GATOS na listagem e MOCK_NOVO_GATO na inserção.
 */
export async function mockGatos(page, { list = MOCK_GATOS, novo = MOCK_NOVO_GATO } = {}) {
  await page.route('**/rest/v1/gatos*', route => {
    const method = route.request().method()
    if (method === 'GET') return route.fulfill(json(list))
    if (method === 'POST') return route.fulfill(json([novo], 201))
    if (method === 'DELETE') return route.fulfill({ status: 204 })
    return route.continue()
  })
}

/**
 * Mocka a Edge Function de convite de usuário.
 * success=false retorna { error: 'Erro ao enviar convite.' } com status 500.
 */
export async function mockInviteUser(page, { success = true } = {}) {
  await page.route('**/functions/v1/create-user*', route => {
    if (success) return route.fulfill(json({ ok: true }))
    return route.fulfill(json({ error: 'Erro ao enviar convite.' }, 500))
  })
}

/**
 * Mocka o endpoint de login do Supabase.
 * success=false retorna 400 com error: 'invalid_grant'.
 */
export async function mockAuthLogin(page, { success = true } = {}) {
  await page.route('**/auth/v1/token*', route => {
    if (success) {
      return route.fulfill(json({
        access_token: 'fake-access-token-test',
        refresh_token: 'fake-refresh-token-test',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: FAKE_USER_ID, email: 'admin@teste.com', aud: 'authenticated', role: 'authenticated' },
      }))
    }
    return route.fulfill(json({ error: 'invalid_grant', error_description: 'Invalid login credentials' }, 400))
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/e2e/fixtures/routes.js
git commit -m "test: fixture de mocking de rotas REST e Auth do Supabase"
```

---

## Task 4: Testes de Login

**Files:**
- Create: `admin/e2e/login.spec.js`

- [ ] **Step 1: Criar `admin/e2e/login.spec.js`**

```js
import { test, expect } from '@playwright/test'
import { mockAuthLogin, mockProfiles, mockAgendamentos } from './fixtures/routes.js'

test.describe('Login', () => {
  test('credenciais válidas redirecionam para /admin', async ({ page }) => {
    await mockAuthLogin(page, { success: true })
    await mockProfiles(page)
    await mockAgendamentos(page)

    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'admin@teste.com')
    await page.fill('input[type="password"]', 'senha123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin\/?$/)
  })

  test('credenciais inválidas exibem mensagem de erro', async ({ page }) => {
    await mockAuthLogin(page, { success: false })

    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'errado@teste.com')
    await page.fill('input[type="password"]', 'senha_errada')
    await page.click('button[type="submit"]')

    await expect(page.locator('p.text-red-500')).toHaveText('Email ou senha incorretos.')
    await expect(page).toHaveURL('/admin/login')
  })

  test('campos vazios: form não envia (página permanece no login)', async ({ page }) => {
    await page.goto('/admin/login')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/login')
  })
})
```

- [ ] **Step 2: Rodar e verificar que os 3 testes passam**

```bash
npm run test:e2e -- --grep "Login"
```

Expected:
```
  Login
    ✓ credenciais válidas redirecionam para /admin
    ✓ credenciais inválidas exibem mensagem de erro
    ✓ campos vazios: form não envia (página permanece no login)

  3 passed
```

- [ ] **Step 3: Commit**

```bash
git add admin/e2e/login.spec.js
git commit -m "test: testes E2E de login (happy path, erro, campos vazios)"
```

---

## Task 5: Testes de Clientes

**Files:**
- Create: `admin/e2e/clientes.spec.js`

- [ ] **Step 1: Criar `admin/e2e/clientes.spec.js`**

```js
import { test, expect } from '@playwright/test'
import { injectAdminSession } from './fixtures/auth.js'
import {
  mockProfiles, mockClientes, mockGatos, mockAgendamentos,
  MOCK_GATOS, MOCK_NOVO_GATO,
} from './fixtures/routes.js'

test.describe('Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await injectAdminSession(page)
    await mockProfiles(page)
    await mockClientes(page)
    await mockAgendamentos(page) // Dashboard faz query em agendamentos ao autenticar
  })

  test('lista clientes carregados do mock', async ({ page }) => {
    await page.goto('/admin/clientes')
    await expect(page.locator('text=Ana Costa')).toBeVisible()
    await expect(page.locator('text=Bruno Lima')).toBeVisible()
  })

  test('criar cliente válido redireciona para lista', async ({ page }) => {
    await page.goto('/admin/clientes/novo')
    await page.fill('input[name="nome"]', 'Novo Cliente Teste')
    await page.fill('input[name="telefone"]', '51 99999-9999')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/clientes$/)
  })

  test('criar sem nome: permanece na página de criação', async ({ page }) => {
    await page.goto('/admin/clientes/novo')
    await page.fill('input[name="telefone"]', '51 99999-9999')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/clientes\/novo$/)
  })

  test('editar cliente: altera nome e redireciona para lista', async ({ page }) => {
    await mockGatos(page, { list: [] })
    await page.goto('/admin/clientes/cliente-1')
    await page.fill('input[name="nome"]', 'Ana Costa Editada')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/clientes$/)
  })

  test('deletar cliente: confirmar remove item da lista', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept())
    await page.goto('/admin/clientes')
    // O primeiro botão "Deletar" corresponde a Ana Costa (primeira da lista mockada)
    await page.locator('button:has-text("Deletar")').first().click()
    await expect(page.locator('text=Ana Costa')).not.toBeVisible()
  })

  test('deletar cliente: cancelar mantém item na lista', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss())
    await page.goto('/admin/clientes')
    await page.locator('button:has-text("Deletar")').first().click()
    await expect(page.locator('text=Ana Costa')).toBeVisible()
  })

  test('busca por nome filtra lista', async ({ page }) => {
    await page.goto('/admin/clientes')
    await page.fill('input[placeholder*="Buscar"]', 'Ana')
    await expect(page.locator('text=Ana Costa')).toBeVisible()
    await expect(page.locator('text=Bruno Lima')).not.toBeVisible()
  })

  test('busca por telefone filtra lista', async ({ page }) => {
    await page.goto('/admin/clientes')
    await page.fill('input[placeholder*="Buscar"]', '99999-0002')
    await expect(page.locator('text=Bruno Lima')).toBeVisible()
    await expect(page.locator('text=Ana Costa')).not.toBeVisible()
  })

  test('adicionar gato na edição aparece na lista', async ({ page }) => {
    await mockGatos(page, { list: [], novo: MOCK_NOVO_GATO })
    await page.goto('/admin/clientes/cliente-1')
    await page.fill('input[placeholder="Nome do gato *"]', 'Mel')
    await page.click('button:has-text("+")')
    await expect(page.locator('text=Mel')).toBeVisible()
  })

  test('remover gato na edição some da lista', async ({ page }) => {
    await mockGatos(page, { list: MOCK_GATOS })
    await page.goto('/admin/clientes/cliente-1')
    await expect(page.locator('text=Whiskers')).toBeVisible()
    await page.locator('button:has-text("Remover")').click()
    await expect(page.locator('text=Whiskers')).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Rodar e verificar que os 10 testes passam**

```bash
npm run test:e2e -- --grep "Clientes"
```

Expected:
```
  Clientes
    ✓ lista clientes carregados do mock
    ✓ criar cliente válido redireciona para lista
    ✓ criar sem nome: permanece na página de criação
    ✓ editar cliente: altera nome e redireciona para lista
    ✓ deletar cliente: confirmar remove item da lista
    ✓ deletar cliente: cancelar mantém item na lista
    ✓ busca por nome filtra lista
    ✓ busca por telefone filtra lista
    ✓ adicionar gato na edição aparece na lista
    ✓ remover gato na edição some da lista

  10 passed
```

- [ ] **Step 3: Commit**

```bash
git add admin/e2e/clientes.spec.js
git commit -m "test: testes E2E de CRUD de clientes e gatos"
```

---

## Task 6: Testes de Agendamentos

**Files:**
- Create: `admin/e2e/agendamentos.spec.js`

- [ ] **Step 1: Criar `admin/e2e/agendamentos.spec.js`**

```js
import { test, expect } from '@playwright/test'
import { injectAdminSession, injectCatSitterSession } from './fixtures/auth.js'
import {
  mockProfiles, mockAgendamentos, mockClientes,
  MOCK_CATSITTER_PROFILE, MOCK_SITTERS,
} from './fixtures/routes.js'

test.describe('Agendamentos', () => {
  test.beforeEach(async ({ page }) => {
    await injectAdminSession(page)
    await mockProfiles(page)
    await mockAgendamentos(page)
    await mockClientes(page) // AgendamentoForm carrega lista de clientes
  })

  test('lista agendamentos carregados do mock', async ({ page }) => {
    await page.goto('/admin/agendamentos')
    await expect(page.locator('text=Ana Costa')).toBeVisible()
    await expect(page.locator('text=Bruno Lima')).toBeVisible()
  })

  test('criar agendamento válido redireciona para lista', async ({ page }) => {
    await page.goto('/admin/agendamentos/novo')
    // Aguarda as opções dos selects serem carregadas
    await page.selectOption('select[name="cliente_id"]', 'cliente-1')
    await page.selectOption('select[name="cat_sitter_id"]', 'sitter-1')
    await page.fill('input[name="data_hora"]', '2026-07-15T10:00')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/agendamentos$/)
  })

  test('editar agendamento: mudar status e redirecionar', async ({ page }) => {
    await page.goto('/admin/agendamentos/ag-1')
    await page.selectOption('select[name="status"]', 'confirmado')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/agendamentos$/)
  })

  test('filtrar por status: lista mostra apenas o status selecionado', async ({ page }) => {
    await page.goto('/admin/agendamentos')
    await page.selectOption('select >> nth=0', 'confirmado')
    await expect(page.locator('text=Bruno Lima')).toBeVisible()
    await expect(page.locator('text=Ana Costa')).not.toBeVisible()
  })

  test('filtrar por data: lista mostra apenas agendamentos da data', async ({ page }) => {
    await page.goto('/admin/agendamentos')
    await page.fill('input[type="date"]', '2026-07-01')
    await expect(page.locator('text=Ana Costa')).toBeVisible()
    await expect(page.locator('text=Bruno Lima')).not.toBeVisible()
  })

  test('limpar filtros: todos os agendamentos reaparecem', async ({ page }) => {
    await page.goto('/admin/agendamentos')
    await page.fill('input[type="date"]', '2026-07-01')
    await expect(page.locator('text=Bruno Lima')).not.toBeVisible()
    await page.click('button:has-text("Limpar filtros")')
    await expect(page.locator('text=Bruno Lima')).toBeVisible()
  })

  test('cat sitter vê agendamento em modo leitura (sem botão Salvar)', async ({ page }) => {
    await injectCatSitterSession(page)
    await mockProfiles(page, { authProfile: MOCK_CATSITTER_PROFILE, list: MOCK_SITTERS })
    await page.goto('/admin/agendamentos/ag-1')
    await expect(page.locator('button:has-text("Salvar")')).not.toBeVisible()
    await expect(page.locator('button:has-text("← Voltar")')).toBeVisible()
  })
})
```

**Nota:** No teste de filtro por status, `select >> nth=0` seleciona o primeiro `<select>` da página (data_hora é um `input`, então o primeiro `<select>` é o de status). Se o layout mudar, ajuste o índice.

- [ ] **Step 2: Rodar e verificar que os 7 testes passam**

```bash
npm run test:e2e -- --grep "Agendamentos"
```

Expected:
```
  Agendamentos
    ✓ lista agendamentos carregados do mock
    ✓ criar agendamento válido redireciona para lista
    ✓ editar agendamento: mudar status e redirecionar
    ✓ filtrar por status: lista mostra apenas o status selecionado
    ✓ filtrar por data: lista mostra apenas agendamentos da data
    ✓ limpar filtros: todos os agendamentos reaparecem
    ✓ cat sitter vê agendamento em modo leitura (sem botão Salvar)

  7 passed
```

- [ ] **Step 3: Commit**

```bash
git add admin/e2e/agendamentos.spec.js
git commit -m "test: testes E2E de CRUD e filtros de agendamentos"
```

---

## Task 7: Testes de Usuários

**Files:**
- Create: `admin/e2e/usuarios.spec.js`

- [ ] **Step 1: Criar `admin/e2e/usuarios.spec.js`**

```js
import { test, expect } from '@playwright/test'
import { injectAdminSession } from './fixtures/auth.js'
import {
  mockProfiles, mockAgendamentos, mockInviteUser, MOCK_SITTERS,
} from './fixtures/routes.js'

test.describe('Usuários', () => {
  test.beforeEach(async ({ page }) => {
    await injectAdminSession(page)
    // Usuários usa a mesma rota /rest/v1/profiles para listar cat sitters
    await mockProfiles(page, { list: MOCK_SITTERS })
    await mockAgendamentos(page)
  })

  test('lista usuários carregados do mock', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('text=Carla Sitter')).toBeVisible()
  })

  test('clicar em "+ Nova Cat Sitter" exibe o formulário', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await page.click('button:has-text("+ Nova Cat Sitter")')
    await expect(page.locator('input[name="nome"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('select[name="role"]')).toBeVisible()
  })

  test('convidar usuário com sucesso exibe mensagem de confirmação', async ({ page }) => {
    await mockInviteUser(page, { success: true })
    await page.goto('/admin/usuarios')
    await page.click('button:has-text("+ Nova Cat Sitter")')
    await page.fill('input[name="nome"]', 'Nova Sitter')
    await page.fill('input[type="email"]', 'nova@sitter.com')
    await page.click('button:has-text("Enviar convite")')
    await expect(page.locator('text=Convite enviado para nova@sitter.com!')).toBeVisible()
  })

  test('enviar sem nome: form não envia', async ({ page }) => {
    await mockInviteUser(page, { success: true })
    await page.goto('/admin/usuarios')
    await page.click('button:has-text("+ Nova Cat Sitter")')
    await page.fill('input[type="email"]', 'nova@sitter.com')
    // Não preenche nome
    await page.click('button:has-text("Enviar convite")')
    // Formulário deve continuar visível (não foi enviado)
    await expect(page.locator('input[name="nome"]')).toBeVisible()
    await expect(page.locator('text=Convite enviado')).not.toBeVisible()
  })

  test('erro no convite exibe mensagem de erro', async ({ page }) => {
    await mockInviteUser(page, { success: false })
    await page.goto('/admin/usuarios')
    await page.click('button:has-text("+ Nova Cat Sitter")')
    await page.fill('input[name="nome"]', 'Sitter Erro')
    await page.fill('input[type="email"]', 'erro@sitter.com')
    await page.click('button:has-text("Enviar convite")')
    await expect(page.locator('p.text-red-500')).toHaveText('Erro ao enviar convite.')
  })

  test('cancelar formulário esconde o form', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await page.click('button:has-text("+ Nova Cat Sitter")')
    await expect(page.locator('input[name="nome"]')).toBeVisible()
    await page.click('button:has-text("Cancelar")')
    await expect(page.locator('input[name="nome"]')).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Rodar e verificar que os 6 testes passam**

```bash
npm run test:e2e -- --grep "Usuários"
```

Expected:
```
  Usuários
    ✓ lista usuários carregados do mock
    ✓ clicar em "+ Nova Cat Sitter" exibe o formulário
    ✓ convidar usuário com sucesso exibe mensagem de confirmação
    ✓ enviar sem nome: form não envia
    ✓ erro no convite exibe mensagem de erro
    ✓ cancelar formulário esconde o form

  6 passed
```

- [ ] **Step 3: Rodar a suite completa**

```bash
npm run test:e2e
```

Expected:
```
  Login            3 passed
  Clientes        10 passed
  Agendamentos     7 passed
  Usuários         6 passed

  26 passed
```

- [ ] **Step 4: Commit final**

```bash
git add admin/e2e/usuarios.spec.js
git commit -m "test: testes E2E de convite de usuários — suite completa 26 testes"
```

---

## Self-Review

**Cobertura do spec:**
- ✅ Login (3 casos)
- ✅ Clientes: listar, criar, criar sem nome, editar, deletar (aceitar/cancelar), busca, gatos (adicionar/remover) — 10 casos
- ✅ Agendamentos: listar, criar, editar, filtros (status/data/limpar), cat sitter read-only — 7 casos
- ✅ Usuários: listar, abrir form, convidar (sucesso/erro), campos obrigatórios, cancelar — 6 casos

**Placeholders:** Nenhum — todos os passos têm código completo.

**Consistência de tipos:**
- `FAKE_USER_ID` exportado de `auth.js` e importado por `routes.js` ✅
- `MOCK_NOVO_GATO` exportado de `routes.js` e importado pelo spec de clientes ✅
- `mockProfiles` aceita `{ authProfile, list }` e ambos os usos são consistentes ✅
- `mockGatos` aceita `{ list, novo }` e o spec passa `MOCK_NOVO_GATO` como `novo` ✅
