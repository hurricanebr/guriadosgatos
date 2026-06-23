# Painel de Agendamentos — Guria dos Gatos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um painel de agendamentos React em `/admin` com autenticação Supabase, controle de roles (admin/catsitter) e CRUD de clientes, gatos e agendamentos.

**Architecture:** React SPA (Vite) em `/admin` servida pela Vercel junto com o site estático existente. Supabase gerencia autenticação e banco de dados PostgreSQL com Row Level Security para separar acesso por role. Criação de usuários via Supabase Edge Function para não expor a service role key no frontend.

**Tech Stack:** React 18, Vite, TailwindCSS v3, React Router v6, Supabase JS v2, React Hook Form

---

## Mapa de Arquivos

```
admin/                          ← novo projeto React
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── supabase/
│   ├── schema.sql              ← SQL para tabelas + RLS
│   └── functions/
│       ├── _shared/cors.ts
│       └── create-user/index.ts  ← Edge Function para criar usuários
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx                 ← rotas
    ├── lib/
    │   └── supabase.js         ← cliente Supabase
    ├── context/
    │   └── AuthContext.jsx     ← session, profile, signIn, signOut, updatePassword
    ├── components/
    │   ├── ProtectedRoute.jsx  ← redireciona se não autenticado
    │   ├── AdminRoute.jsx      ← redireciona se não for admin
    │   └── AppLayout.jsx       ← sidebar + outlet
    └── pages/
        ├── Login.jsx
        ├── PrimeiroAcesso.jsx
        ├── Dashboard.jsx
        ├── Agendamentos.jsx
        ├── AgendamentoForm.jsx
        ├── Clientes.jsx
        ├── ClienteForm.jsx
        └── Usuarios.jsx

vercel.json                     ← na raiz, configura build + rewrites
admin-dist/                     ← output do build (gitignore)
```

---

## Task 1: Scaffolding do Projeto React

**Files:**
- Create: `admin/` (projeto inteiro via Vite)
- Create: `admin/vite.config.js`
- Create: `admin/tailwind.config.js`
- Create: `admin/postcss.config.js`
- Modify: `admin/src/main.jsx`
- Modify: `admin/src/index.css`
- Modify: `.gitignore`

- [ ] **Step 1: Criar projeto com Vite**

```bash
cd c:\Users\cfcar\catsitter
npm create vite@latest admin -- --template react
```

Quando perguntar confirmação de instalar o pacote, pressionar `y`.

- [ ] **Step 2: Instalar dependências**

```bash
cd c:\Users\cfcar\catsitter\admin
npm install
npm install react-router-dom @supabase/supabase-js react-hook-form
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 3: Configurar vite.config.js**

Substituir todo o conteúdo de `admin/vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  build: {
    outDir: '../admin-dist',
    emptyOutDir: true,
  }
})
```

- [ ] **Step 4: Configurar Tailwind**

Substituir `admin/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Substituir `admin/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Limpar arquivos padrão do Vite**

Substituir `admin/src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Substituir `admin/src/App.jsx`:
```jsx
export default function App() {
  return <div className="p-4 text-pink-600 font-bold">Painel Guria dos Gatos</div>
}
```

Deletar os arquivos: `admin/src/App.css`, `admin/src/assets/react.svg`

- [ ] **Step 6: Verificar que o projeto compila**

```bash
cd c:\Users\cfcar\catsitter\admin
npm run build
```

Esperado: sem erros. A pasta `admin-dist/` deve aparecer na raiz do projeto.

- [ ] **Step 7: Atualizar .gitignore**

No arquivo `.gitignore` da raiz (criar se não existir), adicionar:
```
admin-dist/
admin/node_modules/
admin/.env.local
```

- [ ] **Step 8: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/ .gitignore
git commit -m "feat: scaffolding do projeto React para painel admin"
```

---

## Task 2: Schema Supabase

**Files:**
- Create: `admin/supabase/schema.sql`

- [ ] **Step 1: Criar arquivo SQL**

Criar pasta e arquivo `admin/supabase/schema.sql`:

```sql
-- =============================================
-- profiles: complementa auth.users com role e first_login
-- =============================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  role        text not null check (role in ('admin', 'catsitter')),
  first_login boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Trigger: cria profile automaticamente ao criar usuário no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role, first_login)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'catsitter'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- clientes
-- =============================================
create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  telefone    text,
  endereco    text,
  observacoes text,
  created_at  timestamptz not null default now()
);

-- =============================================
-- gatos
-- =============================================
create table if not exists public.gatos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  nome        text not null,
  observacoes text
);

-- =============================================
-- agendamentos
-- =============================================
create table if not exists public.agendamentos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.clientes(id),
  cat_sitter_id   uuid not null references public.profiles(id),
  data_hora       timestamptz not null,
  status          text not null default 'agendado'
                    check (status in ('agendado', 'confirmado', 'realizado', 'cancelado')),
  valor           numeric(10,2),
  endereco_visita text,
  observacoes     text,
  created_at      timestamptz not null default now(),
  created_by      uuid references public.profiles(id)
);

-- =============================================
-- Helper: verifica role sem disparar RLS recursivamente
-- (security definer = roda com permissão do criador, bypassando RLS)
-- =============================================
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- =============================================
-- Row Level Security
-- =============================================

-- profiles
alter table public.profiles enable row level security;

create policy "admin_all_profiles"
  on public.profiles for all
  using (public.get_my_role() = 'admin');

create policy "self_select_profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "self_update_profile"
  on public.profiles for update
  using (id = auth.uid());

-- clientes
alter table public.clientes enable row level security;

create policy "admin_all_clientes"
  on public.clientes for all
  using (public.get_my_role() = 'admin');

-- gatos
alter table public.gatos enable row level security;

create policy "admin_all_gatos"
  on public.gatos for all
  using (public.get_my_role() = 'admin'
  );

-- agendamentos
alter table public.agendamentos enable row level security;

create policy "admin_all_agendamentos"
  on public.agendamentos for all
  using (public.get_my_role() = 'admin');

create policy "catsitter_own_agendamentos"
  on public.agendamentos for select
  using (cat_sitter_id = auth.uid());
```

- [ ] **Step 2: Executar SQL no Supabase**

1. Acessar o dashboard Supabase do projeto
2. Ir em **SQL Editor → New Query**
3. Colar o conteúdo do arquivo `admin/supabase/schema.sql`
4. Clicar em **Run**
5. Verificar que as tabelas `profiles`, `clientes`, `gatos`, `agendamentos` aparecem em **Table Editor**

- [ ] **Step 3: Criar os 3 admins manualmente no Supabase**

No dashboard Supabase, ir em **Authentication → Users → Add User → Create New User**. Criar três usuários:

| Email | Senha (inicial) |
|-------|-----------------|
| maite@guriadosgatos.com.br | Admin@2026! |
| ana@guriadosgatos.com.br | Admin@2026! |
| maikelly@guriadosgatos.com.br | Admin@2026! |

Após criar cada usuário, pegar o `UUID` exibido e executar no SQL Editor (um por vez):
```sql
update public.profiles
set nome = 'Maitê', role = 'admin'
where id = 'UUID-DA-MAITE';

update public.profiles
set nome = 'Ana', role = 'admin'
where id = 'UUID-DA-ANA';

update public.profiles
set nome = 'Maikelly', role = 'admin'
where id = 'UUID-DA-MAIKELLY';
```

- [ ] **Step 4: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/supabase/schema.sql
git commit -m "feat: schema SQL do Supabase com RLS"
```

---

## Task 3: Cliente Supabase e Variáveis de Ambiente

**Files:**
- Create: `admin/.env.local`
- Create: `admin/src/lib/supabase.js`

- [ ] **Step 1: Obter credenciais do Supabase**

1. No dashboard Supabase, ir em **Settings → API**
2. Copiar:
   - **Project URL** (ex: `https://abcdefg.supabase.co`)
   - **anon public** key

- [ ] **Step 2: Criar .env.local**

Criar `admin/.env.local` (nunca commitar este arquivo):
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] **Step 3: Criar cliente Supabase**

Criar `admin/src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 4: Testar conexão**

Substituir `admin/src/App.jsx` temporariamente:
```jsx
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [status, setStatus] = useState('Conectando...')

  useEffect(() => {
    supabase.from('clientes').select('count').then(({ error }) => {
      setStatus(error ? `Erro: ${error.message}` : 'Conectado ao Supabase!')
    })
  }, [])

  return <div className="p-4 font-bold">{status}</div>
}
```

```bash
cd c:\Users\cfcar\catsitter\admin
npm run dev
```

Abrir `http://localhost:5173/admin/`. Esperado: "Conectado ao Supabase!"

- [ ] **Step 5: Commit (sem .env.local)**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/lib/
git commit -m "feat: configurar cliente Supabase"
```

---

## Task 4: Contexto de Autenticação e Guards de Rota

**Files:**
- Create: `admin/src/context/AuthContext.jsx`
- Create: `admin/src/components/ProtectedRoute.jsx`
- Create: `admin/src/components/AdminRoute.jsx`

- [ ] **Step 1: Criar AuthContext**

Criar `admin/src/context/AuthContext.jsx`:
```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = carregando
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) loadProfile(session.user.id)
        else setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    await supabase
      .from('profiles')
      .update({ first_login: false })
      .eq('id', session.user.id)
    setProfile(prev => ({ ...prev, first_login: false }))
  }

  return (
    <AuthContext.Provider value={{ session, profile, signIn, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Criar ProtectedRoute**

Criar `admin/src/components/ProtectedRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, profile } = useAuth()

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  if (profile?.first_login) return <Navigate to="/admin/primeiro-acesso" replace />

  return children
}
```

- [ ] **Step 3: Criar AdminRoute**

Criar `admin/src/components/AdminRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { profile } = useAuth()

  if (!profile) return null

  if (profile.role !== 'admin') return <Navigate to="/admin" replace />

  return children
}
```

- [ ] **Step 4: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/context/ admin/src/components/ProtectedRoute.jsx admin/src/components/AdminRoute.jsx
git commit -m "feat: contexto de autenticação e guards de rota"
```

---

## Task 5: Tela de Login

**Files:**
- Create: `admin/src/pages/Login.jsx`

- [ ] **Step 1: Criar Login.jsx**

Criar `admin/src/pages/Login.jsx`:
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [erro, setErro] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  async function onSubmit({ email, password }) {
    setErro('')
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      setErro('Email ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-pink-700 mb-2 text-center">🐱 Guria dos Gatos</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Painel Administrativo</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              autoComplete="current-password"
            />
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 text-white rounded-lg py-2 font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/pages/Login.jsx
git commit -m "feat: tela de login"
```

---

## Task 6: Tela de Primeiro Acesso

**Files:**
- Create: `admin/src/pages/PrimeiroAcesso.jsx`

- [ ] **Step 1: Criar PrimeiroAcesso.jsx**

Criar `admin/src/pages/PrimeiroAcesso.jsx`:
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function PrimeiroAcesso() {
  const { updatePassword, profile } = useAuth()
  const navigate = useNavigate()
  const [erro, setErro] = useState('')
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm()
  const senha = watch('senha')

  async function onSubmit({ senha, confirmacao }) {
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }
    setErro('')
    try {
      await updatePassword(senha)
      navigate('/admin')
    } catch {
      setErro('Erro ao atualizar senha. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-pink-700 mb-1 text-center">
          Bem-vinda, {profile?.nome}!
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Crie sua senha pessoal para continuar.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              {...register('senha', { required: true, minLength: 8 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              type="password"
              {...register('confirmacao', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 text-white rounded-lg py-2 font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Criar senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/pages/PrimeiroAcesso.jsx
git commit -m "feat: tela de primeiro acesso com troca de senha"
```

---

## Task 7: Layout Base e Roteamento

**Files:**
- Create: `admin/src/components/AppLayout.jsx`
- Modify: `admin/src/App.jsx`
- Create: `admin/src/pages/Dashboard.jsx` (placeholder)
- Create: `admin/src/pages/Agendamentos.jsx` (placeholder)
- Create: `admin/src/pages/AgendamentoForm.jsx` (placeholder)
- Create: `admin/src/pages/Clientes.jsx` (placeholder)
- Create: `admin/src/pages/ClienteForm.jsx` (placeholder)
- Create: `admin/src/pages/Usuarios.jsx` (placeholder)

- [ ] **Step 1: Criar AppLayout com sidebar**

Criar `admin/src/components/AppLayout.jsx`:
```jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'
  }`

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-pink-700">🐱 Guria dos Gatos</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{profile?.nome}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink to="/admin" end className={linkClass}>Início</NavLink>
          <NavLink to="/admin/agendamentos" className={linkClass}>Agendamentos</NavLink>
          {profile?.role === 'admin' && (
            <>
              <NavLink to="/admin/clientes" className={linkClass}>Clientes</NavLink>
              <NavLink to="/admin/usuarios" className={linkClass}>Usuárias</NavLink>
            </>
          )}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-400 hover:text-red-500 py-2 text-left"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Criar placeholders para todas as páginas**

Criar `admin/src/pages/Dashboard.jsx`:
```jsx
export default function Dashboard() {
  return <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
}
```

Criar `admin/src/pages/Agendamentos.jsx`:
```jsx
export default function Agendamentos() {
  return <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
}
```

Criar `admin/src/pages/AgendamentoForm.jsx`:
```jsx
export default function AgendamentoForm() {
  return <h1 className="text-2xl font-bold text-gray-800">Formulário Agendamento</h1>
}
```

Criar `admin/src/pages/Clientes.jsx`:
```jsx
export default function Clientes() {
  return <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
}
```

Criar `admin/src/pages/ClienteForm.jsx`:
```jsx
export default function ClienteForm() {
  return <h1 className="text-2xl font-bold text-gray-800">Formulário Cliente</h1>
}
```

Criar `admin/src/pages/Usuarios.jsx`:
```jsx
export default function Usuarios() {
  return <h1 className="text-2xl font-bold text-gray-800">Usuárias</h1>
}
```

- [ ] **Step 3: Configurar App.jsx com todas as rotas**

Substituir `admin/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
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
          <Route path="/admin/primeiro-acesso" element={<PrimeiroAcesso />} />

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

- [ ] **Step 4: Verificar que o app roda sem erros de compilação**

```bash
cd c:\Users\cfcar\catsitter\admin
npm run dev
```

Abrir `http://localhost:5173/admin/`. Esperado: redireciona para `/admin/login` e exibe a tela de login.

- [ ] **Step 5: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/
git commit -m "feat: layout base com sidebar e roteamento completo"
```

---

## Task 8: Dashboard

**Files:**
- Modify: `admin/src/pages/Dashboard.jsx`

- [ ] **Step 1: Implementar Dashboard**

Substituir `admin/src/pages/Dashboard.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  agendado:  'bg-blue-100 text-blue-700',
  confirmado: 'bg-green-100 text-green-700',
  realizado:  'bg-gray-100 text-gray-600',
  cancelado:  'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const hoje = new Date()
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

      const { data } = await supabase
        .from('agendamentos')
        .select(`
          id, data_hora, status, valor, endereco_visita,
          clientes(nome, telefone),
          profiles!cat_sitter_id(nome)
        `)
        .gte('data_hora', inicio)
        .lt('data_hora', fim)
        .order('data_hora')

      setAgendamentos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const hojeFormatado = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá, {profile?.nome}!</h1>
          <p className="text-sm text-gray-400 capitalize">{hojeFormatado}</p>
        </div>
        {profile?.role === 'admin' && (
          <Link
            to="/admin/agendamentos/novo"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"
          >
            + Novo agendamento
          </Link>
        )}
      </div>

      <h2 className="text-base font-semibold text-gray-600 mb-3">Agendamentos de hoje</h2>

      {loading && <p className="text-gray-400 text-sm">Carregando...</p>}

      {!loading && agendamentos.length === 0 && (
        <p className="text-gray-400 text-sm">Nenhum agendamento para hoje.</p>
      )}

      <div className="space-y-2">
        {agendamentos.map(ag => (
          <Link
            key={ag.id}
            to={`/admin/agendamentos/${ag.id}`}
            className="flex items-start justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-pink-300 transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-800">{ag.clientes?.nome}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {' · '}{ag.profiles?.nome}
              </p>
              {ag.endereco_visita && (
                <p className="text-xs text-gray-400 mt-1">{ag.endereco_visita}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ag.status]}`}>
              {ag.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/pages/Dashboard.jsx
git commit -m "feat: dashboard com agendamentos do dia"
```

---

## Task 9: Módulo Clientes

**Files:**
- Modify: `admin/src/pages/Clientes.jsx`
- Modify: `admin/src/pages/ClienteForm.jsx`

- [ ] **Step 1: Implementar lista de clientes**

Substituir `admin/src/pages/Clientes.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, telefone, endereco')
      .order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  async function deletar(id, nome) {
    if (!confirm(`Deletar cliente "${nome}"? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (!error) setClientes(prev => prev.filter(c => c.id !== id))
  }

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone || '').includes(busca)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <Link
          to="/admin/clientes/novo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"
        >
          + Novo cliente
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      />

      {loading && <p className="text-gray-400 text-sm">Carregando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtrados.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400">Nenhum cliente encontrado.</p>
        )}
        {filtrados.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div>
              <p className="font-medium text-gray-800">{c.nome}</p>
              <p className="text-sm text-gray-400">{c.telefone}</p>
            </div>
            <div className="flex gap-3">
              <Link to={`/admin/clientes/${c.id}`} className="text-sm text-pink-600 hover:underline">
                Editar
              </Link>
              <button
                onClick={() => deletar(c.id, c.nome)}
                className="text-sm text-red-400 hover:underline"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implementar formulário de cliente**

Substituir `admin/src/pages/ClienteForm.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

export default function ClienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdicao = Boolean(id)
  const [gatos, setGatos] = useState([])
  const [novoGato, setNovoGato] = useState({ nome: '', observacoes: '' })
  const [erro, setErro] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (!isEdicao) return
    async function carregar() {
      const [{ data: cliente }, { data: gatosData }] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', id).single(),
        supabase.from('gatos').select('*').eq('cliente_id', id).order('nome'),
      ])
      if (cliente) reset(cliente)
      setGatos(gatosData || [])
    }
    carregar()
  }, [id])

  async function onSubmit(dados) {
    setErro('')
    const payload = {
      nome: dados.nome,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      observacoes: dados.observacoes || null,
    }
    if (isEdicao) {
      const { error } = await supabase.from('clientes').update(payload).eq('id', id)
      if (error) { setErro(error.message); return }
    } else {
      const { error } = await supabase.from('clientes').insert(payload)
      if (error) { setErro(error.message); return }
    }
    navigate('/admin/clientes')
  }

  async function adicionarGato() {
    if (!novoGato.nome.trim()) return
    const { data } = await supabase
      .from('gatos')
      .insert({ cliente_id: id, nome: novoGato.nome, observacoes: novoGato.observacoes || null })
      .select()
      .single()
    if (data) {
      setGatos(prev => [...prev, data])
      setNovoGato({ nome: '', observacoes: '' })
    }
  }

  async function deletarGato(gatoId) {
    await supabase.from('gatos').delete().eq('id', gatoId)
    setGatos(prev => prev.filter(g => g.id !== gatoId))
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdicao ? 'Editar cliente' : 'Novo cliente'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            {...register('nome', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            {...register('telefone')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <input
            {...register('endereco')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            {...register('observacoes')}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clientes')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>

      {isEdicao && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Gatos</h2>
          <div className="space-y-2 mb-4">
            {gatos.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum gato cadastrado.</p>
            )}
            {gatos.map(g => (
              <div key={g.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{g.nome}</span>
                  {g.observacoes && <span className="text-gray-400 ml-2">— {g.observacoes}</span>}
                </div>
                <button
                  onClick={() => deletarGato(g.id)}
                  className="text-red-400 hover:underline text-xs"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Nome do gato *"
              value={novoGato.nome}
              onChange={e => setNovoGato(prev => ({ ...prev, nome: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <input
              placeholder="Observações"
              value={novoGato.observacoes}
              onChange={e => setNovoGato(prev => ({ ...prev, observacoes: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={adicionarGato}
              className="bg-pink-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-700"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/pages/Clientes.jsx admin/src/pages/ClienteForm.jsx
git commit -m "feat: módulo clientes com CRUD e gatos"
```

---

## Task 10: Módulo Agendamentos

**Files:**
- Modify: `admin/src/pages/Agendamentos.jsx`
- Modify: `admin/src/pages/AgendamentoForm.jsx`

- [ ] **Step 1: Implementar lista de agendamentos com filtros**

Substituir `admin/src/pages/Agendamentos.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = { agendado: 'Agendado', confirmado: 'Confirmado', realizado: 'Realizado', cancelado: 'Cancelado' }
const STATUS_COLORS = {
  agendado:  'bg-blue-100 text-blue-700',
  confirmado: 'bg-green-100 text-green-700',
  realizado:  'bg-gray-100 text-gray-600',
  cancelado:  'bg-red-100 text-red-700',
}

export default function Agendamentos() {
  const { profile } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [sitters, setSitters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroSitter, setFiltroSitter] = useState('')

  useEffect(() => {
    carregar()
    if (profile?.role === 'admin') carregarSitters()
  }, [profile])

  async function carregarSitters() {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome')
      .order('nome')
    setSitters(data || [])
  }

  async function carregar() {
    const { data } = await supabase
      .from('agendamentos')
      .select(`
        id, data_hora, status, valor,
        clientes(nome),
        profiles!cat_sitter_id(id, nome)
      `)
      .order('data_hora', { ascending: false })
    setAgendamentos(data || [])
    setLoading(false)
  }

  const filtrados = agendamentos.filter(ag => {
    if (filtroStatus && ag.status !== filtroStatus) return false
    if (filtroData && !ag.data_hora.startsWith(filtroData)) return false
    if (filtroSitter && ag.profiles?.id !== filtroSitter) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
        {profile?.role === 'admin' && (
          <Link
            to="/admin/agendamentos/novo"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"
          >
            + Novo agendamento
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="date"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {profile?.role === 'admin' && (
          <select
            value={filtroSitter}
            onChange={e => setFiltroSitter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">Todas as cat sitters</option>
            {sitters.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        )}
        {(filtroStatus || filtroData || filtroSitter) && (
          <button
            onClick={() => { setFiltroStatus(''); setFiltroData(''); setFiltroSitter('') }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtrados.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400">Nenhum agendamento encontrado.</p>
        )}
        {filtrados.map((ag, i) => (
          <Link
            key={ag.id}
            to={`/admin/agendamentos/${ag.id}`}
            className={`flex items-center justify-between p-4 hover:bg-gray-50 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div>
              <p className="font-medium text-gray-800">{ag.clientes?.nome}</p>
              <p className="text-sm text-gray-400">
                {new Date(ag.data_hora).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {' · '}{ag.profiles?.nome}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {ag.valor && (
                <span className="text-sm text-gray-500">
                  R$ {Number(ag.valor).toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ag.status]}`}>
                {STATUS_LABELS[ag.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implementar formulário de agendamento**

Substituir `admin/src/pages/AgendamentoForm.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AgendamentoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isEdicao = Boolean(id)
  const isAdmin = profile?.role === 'admin'
  const [clientes, setClientes] = useState([])
  const [sitters, setSitters] = useState([])
  const [erro, setErro] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { status: 'agendado' }
  })

  useEffect(() => {
    carregarOpcoes()
    if (isEdicao) carregarAgendamento()
  }, [id])

  async function carregarOpcoes() {
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('profiles').select('id, nome').order('nome'),
    ])
    setClientes(c || [])
    setSitters(s || [])
  }

  async function carregarAgendamento() {
    const { data } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      const dt = new Date(data.data_hora)
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      reset({ ...data, data_hora: local })
    }
  }

  async function onSubmit(dados) {
    setErro('')
    const payload = {
      cliente_id:     dados.cliente_id,
      cat_sitter_id:  dados.cat_sitter_id,
      data_hora:      new Date(dados.data_hora).toISOString(),
      status:         dados.status,
      valor:          dados.valor || null,
      endereco_visita: dados.endereco_visita || null,
      observacoes:    dados.observacoes || null,
    }
    if (isEdicao) {
      const { error } = await supabase.from('agendamentos').update(payload).eq('id', id)
      if (error) { setErro(error.message); return }
    } else {
      const { error } = await supabase.from('agendamentos')
        .insert({ ...payload, created_by: profile.id })
      if (error) { setErro(error.message); return }
    }
    navigate('/admin/agendamentos')
  }

  const disabled = !isAdmin

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdicao
          ? isAdmin ? 'Editar agendamento' : 'Detalhes do agendamento'
          : 'Novo agendamento'}
      </h1>

      <form
        onSubmit={isAdmin ? handleSubmit(onSubmit) : e => e.preventDefault()}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            {...register('cliente_id', { required: true })}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          >
            <option value="">Selecione...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cat Sitter *</label>
          <select
            {...register('cat_sitter_id', { required: true })}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          >
            <option value="">Selecione...</option>
            {sitters.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label>
          <input
            type="datetime-local"
            {...register('data_hora', { required: true })}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          >
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('valor')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço da visita</label>
          <input
            {...register('endereco_visita')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            {...register('observacoes')}
            rows={3}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
          />
        </div>
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        <div className="flex gap-3 pt-2">
          {isAdmin && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin/agendamentos')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            {isAdmin ? 'Cancelar' : '← Voltar'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/src/pages/Agendamentos.jsx admin/src/pages/AgendamentoForm.jsx
git commit -m "feat: módulo agendamentos com CRUD e filtros"
```

---

## Task 11: Módulo Usuárias

**Files:**
- Create: `admin/supabase/functions/_shared/cors.ts`
- Create: `admin/supabase/functions/create-user/index.ts`
- Modify: `admin/src/pages/Usuarios.jsx`

> **Por que Edge Function?** Criar usuários via `supabase.auth.admin.createUser()` requer a `service_role` key, que não pode ficar exposta no frontend. A Edge Function roda no servidor Supabase e tem acesso a essa chave com segurança.

- [ ] **Step 1: Criar arquivos da Edge Function**

Criar `admin/supabase/functions/_shared/cors.ts`:
```ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

Criar `admin/supabase/functions/create-user/index.ts`:
```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Verificar se o chamador é admin
  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: callerProfile } = await callerClient
    .from('profiles')
    .select('role')
    .single()

  if (callerProfile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Apenas admins podem criar usuárias' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { nome, email, senha, role } = await req.json()

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, role },
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ user: data.user }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

- [ ] **Step 2: Fazer deploy da Edge Function no Supabase**

No dashboard Supabase:
1. Ir em **Edge Functions → Deploy a new function**
2. Nomear como `create-user`
3. Colar o conteúdo de `admin/supabase/functions/create-user/index.ts`
4. Clicar em **Deploy**

> Alternativa via CLI (se tiver Supabase CLI instalado):
> ```bash
> cd c:\Users\cfcar\catsitter\admin
> npx supabase functions deploy create-user
> ```

- [ ] **Step 3: Obter a URL da Edge Function**

No dashboard Supabase → Edge Functions → `create-user` → copiar a URL (formato: `https://SEU-PROJETO.supabase.co/functions/v1/create-user`)

- [ ] **Step 4: Adicionar URL ao .env.local**

Adicionar em `admin/.env.local`:
```
VITE_SUPABASE_FUNCTION_CREATE_USER=https://SEU-PROJETO.supabase.co/functions/v1/create-user
```

- [ ] **Step 5: Implementar página de Usuárias**

Substituir `admin/src/pages/Usuarios.jsx`:
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

  async function onSubmit({ nome, email, senha, role }) {
    setErro('')
    setSucesso('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(CREATE_USER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ nome, email, senha, role }),
    })

    const json = await res.json()
    if (!res.ok) {
      setErro(json.error || 'Erro ao criar usuária.')
      return
    }

    setSucesso(`Usuária ${nome} criada com sucesso!`)
    reset()
    setMostrarForm(false)
    carregar()
  }

  const ROLE_LABEL = { admin: 'Admin', catsitter: 'Cat Sitter' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuárias</h1>
        <button
          onClick={() => { setMostrarForm(true); setErro(''); setSucesso('') }}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"
        >
          + Nova usuária
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
          <h2 className="text-base font-semibold text-gray-700">Nova usuária</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                {...register('nome', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
              <select
                {...register('role')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha inicial *</label>
            <input
              type="password"
              {...register('senha', { required: true, minLength: 8 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <p className="text-xs text-gray-400 mt-1">A usuária troca no primeiro acesso.</p>
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar usuária'}
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
          <p className="p-4 text-sm text-gray-400">Nenhuma usuária cadastrada.</p>
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

- [ ] **Step 6: Commit**

```bash
cd c:\Users\cfcar\catsitter
git add admin/supabase/functions/ admin/src/pages/Usuarios.jsx
git commit -m "feat: módulo usuárias com Edge Function de criação de conta"
```

---

## Task 12: Deploy na Vercel

**Files:**
- Create/Modify: `vercel.json` (na raiz)

- [ ] **Step 1: Verificar se já existe vercel.json**

```bash
ls c:\Users\cfcar\catsitter\vercel.json
```

- [ ] **Step 2: Criar ou atualizar vercel.json**

Se **não existir**, criar `vercel.json` na raiz do projeto:
```json
{
  "buildCommand": "cd admin && npm install && npm run build",
  "rewrites": [
    {
      "source": "/admin/assets/:path*",
      "destination": "/admin-dist/assets/:path*"
    },
    {
      "source": "/admin/:path*",
      "destination": "/admin-dist/index.html"
    }
  ]
}
```

Se **já existir**, adicionar os campos `buildCommand` e `rewrites` preservando o que já está no arquivo.

- [ ] **Step 3: Adicionar variáveis de ambiente na Vercel**

1. Acessar o dashboard Vercel → projeto
2. Ir em **Settings → Environment Variables**
3. Adicionar (para Production, Preview e Development):

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | chave anon do Supabase |
| `VITE_SUPABASE_FUNCTION_CREATE_USER` | URL da Edge Function |

- [ ] **Step 4: Verificar build localmente antes do deploy**

```bash
cd c:\Users\cfcar\catsitter\admin
npm run build
```

Esperado: pasta `admin-dist/` criada na raiz sem erros.

- [ ] **Step 5: Commit e push**

```bash
cd c:\Users\cfcar\catsitter
git add vercel.json
git commit -m "feat: configurar deploy do painel admin na Vercel"
git push origin master
```

- [ ] **Step 6: Verificar deploy em produção**

1. Aguardar o deploy completar no dashboard Vercel (2-3 minutos)
2. Acessar `https://guriadosgatos.com.br/admin/`
3. Verificar que a tela de login aparece
4. Fazer login com um dos admins criados no Task 2
5. Verificar que o site de marketing em `https://guriadosgatos.com.br` continua funcionando
