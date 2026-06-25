import { test, expect } from '@playwright/test'
import { injectAdminSession } from './fixtures/auth.js'
import {
  mockProfiles, mockAgendamentos, mockInviteUser, MOCK_SITTERS,
} from './fixtures/routes.js'

test.describe('Usuários', () => {
  test.beforeEach(async ({ page }) => {
    await injectAdminSession(page)
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
    await page.click('button:has-text("Enviar convite")')
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
