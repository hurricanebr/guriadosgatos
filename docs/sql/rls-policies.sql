-- ============================================================
-- RLS — Guria dos Gatos Admin Panel
-- Executar no Supabase Dashboard → SQL Editor
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatos       ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna true se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ────────────────────────────────────────────────
-- SELECT: próprio usuário ou admin
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- UPDATE: próprio usuário ou admin
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- INSERT e DELETE: apenas service_role (Edge Function)
-- Sem policy pública → acesso bloqueado para clientes autenticados

-- ── clientes ────────────────────────────────────────────────
-- SELECT: qualquer autenticado (Cat Sitters precisam ver nome do cliente)
CREATE POLICY "clientes_select" ON public.clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "clientes_insert" ON public.clientes
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "clientes_update" ON public.clientes
  FOR UPDATE USING (is_admin());

CREATE POLICY "clientes_delete" ON public.clientes
  FOR DELETE USING (is_admin());

-- ── agendamentos ─────────────────────────────────────────────
-- SELECT: admin vê todos; Cat Sitter vê só os seus
CREATE POLICY "agendamentos_select" ON public.agendamentos
  FOR SELECT USING (is_admin() OR cat_sitter_id = auth.uid());

CREATE POLICY "agendamentos_insert" ON public.agendamentos
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "agendamentos_update" ON public.agendamentos
  FOR UPDATE USING (is_admin());

CREATE POLICY "agendamentos_delete" ON public.agendamentos
  FOR DELETE USING (is_admin());

-- ── gatos ────────────────────────────────────────────────────
CREATE POLICY "gatos_select" ON public.gatos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "gatos_insert" ON public.gatos
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "gatos_update" ON public.gatos
  FOR UPDATE USING (is_admin());

CREATE POLICY "gatos_delete" ON public.gatos
  FOR DELETE USING (is_admin());
