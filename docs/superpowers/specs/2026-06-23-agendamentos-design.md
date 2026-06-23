# Design: Painel de Agendamentos — Guria dos Gatos

**Data:** 2026-06-23  
**Status:** Aprovado

---

## Contexto

O site guriadosgatos.com.br é um site estático (HTML/CSS/JS) hospedado na Vercel. O objetivo é adicionar um painel de agendamentos para uso interno da equipe, sem alterar o site de marketing existente.

---

## Arquitetura Geral

```
guriadosgatos.com.br/          ← site estático atual (sem mudança)
guriadosgatos.com.br/admin/    ← novo React SPA
```

**Componentes:**
- **Supabase** — banco PostgreSQL, autenticação (email/senha), Row Level Security
- **React SPA** — pasta `/admin` com Vite + React. Build separado, deploy na mesma Vercel
- **Vercel** — serve os dois: site estático na raiz, React app em `/admin`

**Fluxo de dados:**
```
Browser → React App → Supabase JS SDK → Supabase (Auth + DB)
```

Nenhum backend próprio necessário. O Supabase gerencia auth e dados diretamente do navegador com segurança via Row Level Security (RLS).

---

## Usuários do Sistema

**Dois roles:**

| Role | Descrição |
|------|-----------|
| `admin` | Maitê, Ana, Maikelly — acesso total |
| `catsitter` | Cat sitters — leitura dos próprios agendamentos |

**Clientes** são apenas dados cadastrais. Não possuem login no sistema.

---

## Banco de Dados (Supabase)

### Tabelas

```sql
-- Tabela profiles (complementa o Supabase Auth)
profiles
  id            uuid (PK, = auth.users.id)
  nome          text NOT NULL
  role          text  -- 'admin' | 'catsitter'
  first_login   boolean DEFAULT true
  created_at    timestamptz

clientes
  id            uuid (PK)
  nome          text NOT NULL
  telefone      text
  endereco      text
  observacoes   text
  created_at    timestamptz

gatos
  id            uuid (PK)
  cliente_id    uuid (FK → clientes.id)
  nome          text NOT NULL
  observacoes   text

agendamentos
  id            uuid (PK)
  cliente_id    uuid (FK → clientes.id)
  cat_sitter_id uuid (FK → profiles.id)
  data_hora     timestamptz NOT NULL
  status        text  -- 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
  valor         numeric(10,2)
  endereco_visita text
  observacoes   text
  created_at    timestamptz
  created_by    uuid (FK → profiles.id)
```

### Row Level Security (RLS)

| Tabela | Admin | Cat Sitter |
|--------|-------|------------|
| clientes | CRUD completo | sem acesso |
| gatos | CRUD completo | sem acesso |
| agendamentos | CRUD completo | SELECT onde `cat_sitter_id = auth.uid()` |
| profiles | CRUD completo | SELECT próprio perfil |

---

## Telas

### Admin

| Rota | Descrição |
|------|-----------|
| `/admin/login` | Login (email + senha) |
| `/admin/` | Dashboard — agendamentos do dia |
| `/admin/agendamentos` | Lista completa com filtros (data, status, cat sitter) |
| `/admin/agendamentos/novo` | Criar agendamento |
| `/admin/agendamentos/:id` | Ver / editar agendamento |
| `/admin/clientes` | Lista de clientes |
| `/admin/clientes/novo` | Cadastrar cliente |
| `/admin/clientes/:id` | Ver / editar / deletar cliente |
| `/admin/usuarios` | Lista de cat sitters |
| `/admin/usuarios/novo` | Criar usuário (email + senha inicial) |

### Cat Sitter

| Rota | Descrição |
|------|-----------|
| `/admin/login` | Mesmo login |
| `/admin/` | Dashboard — apenas seus agendamentos do dia |
| `/admin/agendamentos` | Lista dos próprios agendamentos (somente leitura) |
| `/admin/agendamentos/:id` | Ver detalhes (somente leitura) |

### Primeiro Acesso

Ao logar pela primeira vez, o sistema detecta `first_login = true` e redireciona para tela de troca de senha antes de entrar no dashboard.

---

## Stack Técnica

| Tecnologia | Uso |
|-----------|-----|
| Vite + React | Build e framework frontend |
| React Router | Navegação entre telas |
| Supabase JS | Auth + queries ao banco |
| TailwindCSS | Estilização |
| React Hook Form | Formulários |

---

## Estrutura de Pastas

```
catsitter/
├── index.html          (site atual — sem mudança)
├── sobre-nos.html
├── css/
├── js/
└── admin/              ← novo projeto React
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── lib/
        │   └── supabase.js       (cliente Supabase configurado)
        ├── pages/
        │   ├── Login.jsx
        │   ├── PrimeiroAcesso.jsx
        │   ├── Dashboard.jsx
        │   ├── Agendamentos.jsx
        │   ├── AgendamentoDetalhe.jsx
        │   ├── Clientes.jsx
        │   ├── ClienteDetalhe.jsx
        │   └── Usuarios.jsx
        └── components/
            ├── ProtectedRoute.jsx  (redireciona se não autenticado)
            ├── AdminRoute.jsx      (redireciona se não for admin)
            └── Navbar.jsx
```

---

## Deploy na Vercel

A Vercel detecta automaticamente o app React em `/admin` via `vite.config.js`. O build é configurado com `base: '/admin/'`. Nenhuma configuração extra de DNS necessária — tudo no mesmo projeto e domínio.

---

## Fora de Escopo (v1)

- Notificações automáticas (WhatsApp, email)
- App mobile
- Relatórios financeiros avançados
- Integração com Google Calendar
