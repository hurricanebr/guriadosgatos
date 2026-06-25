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
    await mockAgendamentos(page)
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
