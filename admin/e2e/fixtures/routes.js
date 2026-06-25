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
    const req = route.request()
    const accept = req.headers()['accept'] || ''
    // .single() sends Accept: application/vnd.pgrst.object+json — PostgREST returns
    // a plain object (not an array). Return the object directly to match that behavior.
    if (url.includes('id=eq.')) {
      if (accept.includes('application/vnd.pgrst.object+json')) {
        return route.fulfill(json(authProfile))
      }
      return route.fulfill(json([authProfile]))
    }
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
    const accept = route.request().headers()['accept'] || ''
    if (method === 'GET') {
      if (url.includes('id=eq.')) {
        // .single() sends Accept: application/vnd.pgrst.object+json — return plain object
        if (accept.includes('application/vnd.pgrst.object+json')) {
          return route.fulfill(json(list[0]))
        }
        return route.fulfill(json([list[0]]))
      }
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
    const accept = route.request().headers()['accept'] || ''
    if (method === 'GET') return route.fulfill(json(list))
    if (method === 'POST') {
      // .insert().select().single() sends Accept: application/vnd.pgrst.object+json
      if (accept.includes('application/vnd.pgrst.object+json')) {
        return route.fulfill(json(novo, 201))
      }
      return route.fulfill(json([novo], 201))
    }
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
