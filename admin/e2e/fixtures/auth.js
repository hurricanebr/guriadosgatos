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

  // Intercepta refresh de token (supabase-js v2 pode chamar /auth/v1/token?grant_type=refresh_token)
  await page.route('**/auth/v1/token**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...FAKE_SESSION,
        user: FAKE_SESSION.user,
      }),
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
