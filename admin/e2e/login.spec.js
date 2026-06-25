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
