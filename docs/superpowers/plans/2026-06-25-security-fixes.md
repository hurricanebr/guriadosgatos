# Security Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir três vulnerabilidades de segurança: autorização client-side sem RLS (VULN-001), rota de primeiro acesso sem proteção de sessão (VULN-002) e senha inicial transmitida em texto puro para Edge Function (VULN-003).

**Architecture:** VULN-001 adiciona políticas RLS no Supabase via script SQL executado manualmente no dashboard. VULN-002 cria um componente `SessionRoute` que protege apenas por sessão (sem checar `first_login`). VULN-003 substitui a criação com senha por fluxo de convite via `inviteUserByEmail` na Edge Function.

**Tech Stack:** React 19, Vite 8, react-router-dom 7, @supabase/supabase-js 2, Deno (Edge Function), Tailwind CSS 3

---

## Mapa de Arquivos

| Arquivo | Ação |
|---|---|
| `docs/sql/rls-policies.sql` | Criar — script SQL para executar no Supabase Dashboard |
| `admin/src/components/SessionRoute.jsx` | Criar — guard de rota que verifica só sessão |
| `admin/src/App.jsx` | Modificar — usar `SessionRoute` na rota `/admin/primeiro-acesso` |
| `supabase/functions/create-user/index.ts` | Criar — Edge Function completa com fluxo de convite |
| `admin/src/pages/Usuarios.jsx` | Modificar — remover campo senha, atualizar submit e mensagem |

---

## Task 1: Script SQL de RLS (VULN-001)

**Files:**
- Create: `docs/sql/rls-policies.sql`

- [ ] **Step 1: Criar o arquivo SQL**

Criar `docs/sql/rls-policies.sql` com o conteúdo abaixo:

```sql
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
```

- [ ] **Step 2: Verificar o arquivo**

```bash
cat docs/sql/rls-policies.sql
```
Esperado: arquivo com 60+ linhas, sem erros de sintaxe visíveis.

- [ ] **Step 3: Executar no Supabase Dashboard**

1. Abrir o projeto no [supabase.com](https://supabase.com) → **SQL Editor**
2. Colar o conteúdo completo do arquivo
3. Clicar em **Run**
4. Esperado: `Success. No rows returned` (sem erros)

- [ ] **Step 4: Verificar políticas criadas**

No SQL Editor, executar:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
Esperado: 13 policies listadas (profiles ×2, clientes ×4, agendamentos ×4, gatos ×4) mais a função `is_admin`.

- [ ] **Step 5: Commit**

```bash
git add docs/sql/rls-policies.sql
git commit -m "feat: script SQL com políticas RLS para profiles, clientes, agendamentos e gatos"
```

---

## Task 2: Componente SessionRoute (VULN-002 — parte 1)

**Files:**
- Create: `admin/src/components/SessionRoute.jsx`

- [ ] **Step 1: Criar o componente**

Criar `admin/src/components/SessionRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SessionRoute({ children }) {
  const { session } = useAuth()

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return children
}
```

- [ ] **Step 2: Verificar que o arquivo foi criado**

```bash
ls admin/src/components/
```
Esperado: `AdminRoute.jsx  AppLayout.jsx  ProtectedRoute.jsx  SessionRoute.jsx`

---

## Task 3: Atualizar App.jsx (VULN-002 — parte 2)

**Files:**
- Modify: `admin/src/App.jsx`

- [ ] **Step 1: Adicionar import e trocar wrapper da rota**

Abrir `admin/src/App.jsx`. Adicionar o import do `SessionRoute` e trocar o elemento da rota `/admin/primeiro-acesso`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import SessionRoute from './components/SessionRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import AgendamentoForm from './pages/AgendamentoForm'
import Clientes from './pages/Clientes'
import ClienteForm from './pages/ClienteForm'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/primeiro-acesso" element={
            <SessionRoute><PrimeiroAcesso /></SessionRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />

            <Route path="agendamentos" element={<Agendamentos />} />
            <Route path="agendamentos/novo" element={
              <AdminRoute><AgendamentoForm /></AdminRoute>
            } />
            <Route path="agendamentos/:id" element={<AgendamentoForm />} />

            <Route path="clientes" element={
              <AdminRoute><Clientes /></AdminRoute>
            } />
            <Route path="clientes/novo" element={
              <AdminRoute><ClienteForm /></AdminRoute>
            } />
            <Route path="clientes/:id" element={
              <AdminRoute><ClienteForm /></AdminRoute>
            } />

            <Route path="usuarios" element={
              <AdminRoute><Usuarios /></AdminRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Build para verificar sem erros**

```bash
cd admin && npm run build
```
Esperado: `✓ built in Xs` sem erros ou warnings de import.

- [ ] **Step 3: Verificação manual**

Abrir o browser em modo anônimo (sem sessão ativa), navegar para `http://localhost:5173/admin/primeiro-acesso`.
Esperado: redireciona para `/admin/login`.

Para testar o dev server:
```bash
cd admin && npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add admin/src/components/SessionRoute.jsx admin/src/App.jsx
git commit -m "feat: proteger rota /admin/primeiro-acesso com SessionRoute (VULN-002)"
```

---

## Task 4: Edge Function com Fluxo de Convite (VULN-003 — parte 1)

**Files:**
- Create: `supabase/functions/create-user/index.ts`

- [ ] **Step 1: Criar a estrutura de diretórios**

```bash
mkdir -p supabase/functions/create-user
```

- [ ] **Step 2: Criar a Edge Function**

Criar `supabase/functions/create-user/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verificar que o chamador está autenticado
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que o chamador é admin (autorização server-side)
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { nome, email, role } = await req.json()

    if (!nome || !email || !role) {
      return new Response(
        JSON.stringify({ error: 'nome, email e role são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['admin', 'catsitter'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'role deve ser "admin" ou "catsitter"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar convite por email (sem senha)
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { nome, role },
      redirectTo: `${Deno.env.get('SITE_URL') ?? ''}/admin`,
    })

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar registro em profiles com first_login = true
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: inviteData.user.id,
        nome,
        role,
        first_login: true,
      })

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

- [ ] **Step 3: Adicionar variável SITE_URL no Supabase**

No Supabase Dashboard → **Edge Functions → Secrets**, adicionar:
```
SITE_URL = https://<seu-dominio-de-producao>
```
Exemplo: `https://guriadosgatos.com.br`

- [ ] **Step 4: Deploy da Edge Function**

Se tiver o Supabase CLI instalado:
```bash
supabase functions deploy create-user
```

Sem CLI: fazer upload do arquivo via **Supabase Dashboard → Edge Functions → create-user → Deploy**.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/create-user/index.ts
git commit -m "feat: Edge Function create-user com fluxo de convite por email (VULN-003)"
```

---

## Task 5: Atualizar Usuarios.jsx (VULN-003 — parte 2)

**Files:**
- Modify: `admin/src/pages/Usuarios.jsx`

- [ ] **Step 1: Remover campo senha e atualizar o componente**

Substituir o conteúdo completo de `admin/src/pages/Usuarios.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

const CREATE_USER_URL = import.meta.env.VITE_SUPABASE_FUNCTION_CREATE_USER

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { role: 'catsitter' }
  })

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role, first_login, created_at')
      .order('nome')
    setUsuarios(data || [])
    setLoading(false)
  }

  async function onSubmit({ nome, email, role }) {
    setErro('')
    setSucesso('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(CREATE_USER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ nome, email, role }),
    })

    const json = await res.json()
    if (!res.ok) {
      setErro(json.error || 'Erro ao enviar convite.')
      return
    }

    setSucesso(`Convite enviado para ${email}!`)
    reset()
    setMostrarForm(false)
    carregar()
  }

  const ROLE_LABEL = { admin: 'Admin', catsitter: 'Cat Sitter' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cat Sitters</h1>
        <button
          onClick={() => { setMostrarForm(true); setErro(''); setSucesso('') }}
          className="bg-brand text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          + Nova Cat Sitter
        </button>
      </div>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
          {sucesso}
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-gray-700">Nova Cat Sitter</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                {...register('nome', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
              <select
                {...register('role')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="catsitter">Cat Sitter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <p className="text-xs text-gray-400">
            A Cat Sitter receberá um email com o link de acesso e definirá a própria senha.
          </p>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Enviando convite...' : 'Enviar convite'}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-gray-400">Carregando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {usuarios.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400">Nenhuma Cat Sitter cadastrada.</p>
        )}
        {usuarios.map((u, i) => (
          <div
            key={u.id}
            className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div>
              <p className="font-medium text-gray-800">{u.nome}</p>
              <p className="text-sm text-gray-400">{ROLE_LABEL[u.role]}</p>
            </div>
            {u.first_login && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Aguardando 1º acesso
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build para verificar sem erros**

```bash
cd admin && npm run build
```
Esperado: `✓ built in Xs` sem erros.

- [ ] **Step 3: Verificação manual do formulário**

Iniciar o dev server:
```bash
cd admin && npm run dev
```
1. Fazer login como admin
2. Navegar para Cat Sitters → Nova Cat Sitter
3. Verificar que o campo "Senha inicial" **não existe mais** no formulário
4. Preencher nome, email e função → clicar em "Enviar convite"
5. Esperado: mensagem verde `"Convite enviado para {email}!"`

- [ ] **Step 4: Commit**

```bash
git add admin/src/pages/Usuarios.jsx
git commit -m "feat: remover senha do formulário de criação de Cat Sitter, usar fluxo de convite (VULN-003)"
```

---

## Task 6: Configuração do Supabase Dashboard e Verificação Final

- [ ] **Step 1: Confirmar Site URL no Supabase**

Acessar **Supabase Dashboard → Authentication → URL Configuration**.
Verificar que **Site URL** aponta para a URL de produção (ex: `https://guriadosgatos.com.br`).
Se estiver em branco ou incorreto, atualizar.

- [ ] **Step 2: Testar fluxo de convite end-to-end (staging/produção)**

1. Fazer login como admin no painel
2. Criar uma Cat Sitter de teste com um email real acessível
3. Abrir o email recebido → clicar no link de acesso
4. Verificar que redireciona para `/admin/primeiro-acesso`
5. Definir senha → verificar que redireciona para `/admin`

- [ ] **Step 3: Testar proteção RLS (devtools)**

Ainda logado como Cat Sitter (não admin), abrir o console do navegador e executar:
```javascript
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
// Não precisa de teste real — o Supabase JS client já usa a sessão ativa
// Verificar via painel: Cat Sitter não deve ver a aba "Clientes" ou "Cat Sitters"
```

Ou via curl com o token da Cat Sitter:
```bash
curl -X DELETE \
  "https://<SUPABASE_URL>/rest/v1/clientes?id=eq.<qualquer-id>" \
  -H "Authorization: Bearer <token-da-catsitter>" \
  -H "apikey: <anon-key>"
```
Esperado: `{"code":"42501","message":"new row violates row-level security policy"}` ou similar.

- [ ] **Step 4: Commit final de verificação**

```bash
git add .
git commit -m "chore: verificação e configuração final das correções de segurança"
```

---

## Ordem de Deploy em Produção

1. Executar `docs/sql/rls-policies.sql` no Supabase Dashboard (SQL Editor)
2. Deploy da Edge Function `supabase/functions/create-user/index.ts`
3. Deploy do frontend (Vercel detecta push automático)
