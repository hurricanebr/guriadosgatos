# Design: Correções de Segurança (VULN-001, VULN-002, VULN-003)

**Data:** 2026-06-25
**Escopo:** Painel admin — `admin/src/` + Edge Function `create-user`

---

## Visão Geral

Três vulnerabilidades identificadas na revisão de segurança são corrigidas neste ciclo. O deploy deve ser coordenado: o SQL do RLS é executado no Supabase antes do deploy do frontend.

```
[1] SQL no Supabase (RLS)   → executar no dashboard antes do deploy
[2] SessionRoute (frontend) → novo componente + App.jsx
[3] Invite flow             → nova Edge Function + remoção do campo senha
```

---

## VULN-001 — Row-Level Security (RLS)

### Problema
A autorização do painel é puramente frontend (React Router). Qualquer usuário autenticado pode chamar o SDK do Supabase diretamente no console do navegador e modificar dados restritos a admin.

### Solução

#### Função auxiliar
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;
```

#### Tabela `profiles`
| Operação | Política |
|---|---|
| SELECT | `auth.uid() = id OR is_admin()` |
| UPDATE | `auth.uid() = id OR is_admin()` |
| INSERT | sem política pública (apenas `service_role` via Edge Function) |
| DELETE | sem política pública |

#### Tabela `clientes`
| Operação | Política |
|---|---|
| SELECT | `auth.role() = 'authenticated'` (Cat Sitters precisam ver nome do cliente no agendamento) |
| INSERT | `is_admin()` |
| UPDATE | `is_admin()` |
| DELETE | `is_admin()` |

#### Tabela `agendamentos`
| Operação | Política |
|---|---|
| SELECT | `is_admin() OR cat_sitter_id = auth.uid()` |
| INSERT | `is_admin()` |
| UPDATE | `is_admin()` |
| DELETE | `is_admin()` |

#### Tabela `gatos`
| Operação | Política |
|---|---|
| SELECT | `auth.role() = 'authenticated'` |
| INSERT | `is_admin()` |
| UPDATE | `is_admin()` |
| DELETE | `is_admin()` |

### Entregável
Script SQL completo pronto para colar no **SQL Editor** do Supabase Dashboard.

---

## VULN-002 — Proteção da Rota `/admin/primeiro-acesso`

### Problema
A rota de troca de senha no primeiro acesso não exige sessão ativa. Usuários não autenticados conseguem acessar a página.

### Solução

Novo componente `admin/src/components/SessionRoute.jsx`:
- Sessão carregando → exibe "Carregando..."
- Sem sessão → redireciona para `/admin/login`
- Com sessão → renderiza os filhos **sem verificar `first_login`** (evita loop infinito com `ProtectedRoute`)

| Componente | Verifica sessão | Verifica `first_login` | Usado em |
|---|---|---|---|
| `ProtectedRoute` | sim | sim | `/admin/*` |
| `SessionRoute` | sim | não | `/admin/primeiro-acesso` |

### Arquivos alterados
- **Novo:** `admin/src/components/SessionRoute.jsx`
- **Alterado:** `admin/src/App.jsx` — uma linha, troca o wrapper da rota

---

## VULN-003 — Fluxo de Convite (sem senha inicial)

### Problema
A senha inicial é enviada em texto puro do frontend para a Edge Function. Se os logs da Edge Function forem expostos, as senhas de todas as Cat Sitters criadas ficam visíveis.

### Solução

#### Frontend — `admin/src/pages/Usuarios.jsx`
- Remover campo "Senha inicial" do formulário
- Remover validação `minLength: 8`
- Corpo do `fetch`: `{ nome, email, role }` (sem `senha`)
- Mensagem de sucesso: `"Convite enviado para {email}!"`

#### Edge Function — `supabase/functions/create-user/index.ts`
Implementação completa nova. Fluxo interno:

1. Valida presença do header `Authorization`
2. Verifica que o chamador tem `role = 'admin'` em `profiles` (autorização server-side)
3. Chama `supabase.auth.admin.inviteUserByEmail(email)` — sem senha
4. Cria registro em `profiles` com `{ id, nome, role, first_login: true }`
5. Retorna `{ success: true }` ou erro descritivo

#### Fluxo do convite (UX)
1. Admin cria Cat Sitter → Supabase envia email com link de acesso
2. Cat Sitter clica no link → cai em `/admin` com sessão ativa
3. `ProtectedRoute` detecta `first_login = true` → redireciona para `/admin/primeiro-acesso`
4. Cat Sitter define a própria senha → `first_login` vira `false`
5. Acesso normal ao painel

O componente `PrimeiroAcesso` existente não precisa de alterações.

#### Configuração no Supabase Dashboard
- **Authentication → URL Configuration → Site URL**: confirmar que aponta para a URL de produção

---

## Ordem de Deploy

1. Executar script SQL no Supabase Dashboard (RLS)
2. Deploy da Edge Function atualizada
3. Deploy do frontend (SessionRoute + Usuarios sem senha)

---

## Arquivos Afetados

| Arquivo | Tipo de mudança |
|---|---|
| `admin/src/components/SessionRoute.jsx` | Novo |
| `admin/src/App.jsx` | Alterado (1 linha) |
| `admin/src/pages/Usuarios.jsx` | Alterado (remove campo senha) |
| `supabase/functions/create-user/index.ts` | Novo (implementação completa) |
| Script SQL RLS | Novo (executar no dashboard) |
