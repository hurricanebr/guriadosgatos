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
    await mockClientes(page)
  })

  test('lista agendamentos carregados do mock', async ({ page }) => {
    await page.goto('/admin/agendamentos')
    await expect(page.locator('text=Ana Costa')).toBeVisible()
    await expect(page.locator('text=Bruno Lima')).toBeVisible()
  })

  test('criar agendamento válido redireciona para lista', async ({ page }) => {
    await page.goto('/admin/agendamentos/novo')
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
    await page.unrouteAll()
    await injectCatSitterSession(page)
    await mockProfiles(page, { authProfile: MOCK_CATSITTER_PROFILE, list: MOCK_SITTERS })
    await mockAgendamentos(page)
    await mockClientes(page)
    await page.goto('/admin/agendamentos/ag-1')
    await expect(page.locator('button:has-text("Salvar")')).not.toBeVisible()
    await expect(page.locator('button:has-text("← Voltar")')).toBeVisible()
  })
})
