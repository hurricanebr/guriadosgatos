# Design Spec: Página de Venda — E-book GATIFIQUE-se

**Data:** 2026-06-15
**Projeto:** Guria dos Gatos
**Arquivo de saída:** `gatifique-se.html`

---

## Objetivo

Criar uma landing page de alta conversão para venda do e-book digital "GATIFIQUE-se: Guia Definitivo de Como Cuidar do Seu Gato", da Guria dos Gatos. A página é standalone (sem navbar de saída) para maximizar foco na compra.

**Link de compra:** https://pay.kiwify.com.br/PtIZo1R
**Preço:** R$ 87,90

---

## Público-alvo

- Tutores que querem entender melhor seu gato
- Pessoas que nunca tiveram gatos e querem se preparar para adotar
- Tutores que não sabem como brincar com seu gato
- Quem quer entender enriquecimento ambiental
- Quem quer dicas de higiene, saúde e bem-estar felino
- Tutores com múltiplos gatos que precisam fazer adaptação

---

## Identidade Visual

Herda o design system do site principal:
- **Paleta:** `--color-primary: #7B35D8`, `--color-primary-dark: #2D1564`, `--color-accent: #FFB8C6`, `--color-bg: #FDFBFF`
- **Fontes:** Dancing Script (títulos) + Nunito (corpo)
- **Componentes:** `.btn`, `.card`, `.badge`, `.section`, `.section--alt`, `.fade-up`
- **Gatinhos decorativos:** PNGs existentes em `images/`
- **Acento dourado:** `#F5A623` usado com moderação (inspirado na capa do ebook)

---

## Arquitetura de Arquivos

- `gatifique-se.html` — página principal
- `css/style.css` — adições ao final (classes prefixadas com `.ebook-`)
- `images/ebook-capa.png` — capa do ebook (usuário deve salvar o arquivo)

---

## Estrutura de Seções

### 1. Header mínimo (`.ebook-header`)
- Logo `logo-avatar.png` + texto "Guria dos Gatos", centralizados
- Clicável → `index.html`
- Fundo branco, borda inferior `1px solid var(--color-primary-light)`
- Sem links de navegação

### 2. Hero (`.ebook-hero`)
- Layout dois colunas desktop (texto esq. | capa dir.), coluna única mobile (capa topo, texto embaixo)
- **Coluna texto:**
  - Badge: "E-book Digital"
  - H1 Dancing Script: "GATIFIQUE-se"
  - Subtítulo: "O guia definitivo de como cuidar do seu gato"
  - Preço em destaque: "R$ 87,90" (fonte grande, cor primary)
  - CTA primário: "Quero meu e-book agora →" → `https://pay.kiwify.com.br/PtIZo1R`
- **Coluna imagem:** `images/ebook-capa.png`, sombra, leve rotação (-2deg) no desktop
- Fundo: `--color-bg` com gatinho decorativo posicionado absolutamente

### 3. Para quem é (`.ebook-forquem`)
- Fundo `--color-section-alt` (roxo escuro)
- H2 branco: "Este e-book é para você que..."
- Grid 2×3 (desktop) / 1 coluna (mobile)
- Cada item: ícone check SVG roxo claro + texto branco
- 6 bullets:
  1. Precisa entender melhor o seu gatinho
  2. Nunca teve gatos e quer se preparar para adotar um
  3. Não sabe como brincar com seu gato
  4. Quer entender o que são recursos e como distribuí-los na sua casa
  5. Quer dicas valiosas de higiene, saúde e bem-estar
  6. Precisa adaptar seus gatos e não sabe por onde começar

### 4. O que você vai aprender (`.ebook-aprenda`)
- Fundo `--color-bg`
- H2: "O que você vai aprender"
- Grid 3×2 (desktop) / 1 coluna (mobile) de `.card`
- 6 cards com ícone SVG + título + descrição (1-2 frases):
  1. **Comportamento Felino** — entenda a linguagem corporal e as necessidades do seu gato
  2. **Preparação para Adotar** — tudo que você precisa ter em casa antes de trazer um gatinho
  3. **Brincadeiras e Estimulação** — como e quando brincar para promover bem-estar físico e mental
  4. **Enriquecimento Ambiental** — recursos, arranhadores, tocas e playgrounds estratégicos
  5. **Higiene e Saúde** — limpeza de olhos, corte de unhas, escovação e cuidados preventivos
  6. **Adaptação Felina** — como introduzir um novo gato respeitando o tempo de cada um

### 5. Sobre a autora (`.ebook-autora`)
- Fundo branco
- Layout: foto (logo-avatar.png, circular, 100px) + texto
- Texto: "Guria dos Gatos" como nome, parágrafo curto de credencial:
  > "Cat sitter domiciliar em Porto Alegre, com anos de experiência no comportamento e bem-estar felino. O GATIFIQUE-se nasceu da vontade de compartilhar tudo o que aprendi cuidando de dezenas de gatinhos — para que você e seu gato tenham a melhor vida juntos."
- Gatinho decorativo (PNG existente) posicionado no lado oposto

### 6. CTA Final (`.ebook-cta-final`)
- Fundo `--color-primary` (roxo)
- H2 branco: "Pronto para se GATIFICAR?"
- Preço em branco, grande: "R$ 87,90"
- Subtexto branco: "Acesso imediato após a compra. E-book em PDF."
- Botão branco grande: "Garantir meu e-book agora →" → `https://pay.kiwify.com.br/PtIZo1R`
- Nota: espaço reservado para depoimentos pode ser inserido aqui quando disponível

### 7. Footer mínimo (`.ebook-footer`)
- Fundo `--color-primary-dark`
- Texto branco: "© 2025 Guria dos Gatos"
- Ícones SVG Instagram e Facebook com links

---

## Comportamento Responsivo

| Breakpoint | Hero | Para quem é | Cards |
|---|---|---|---|
| Desktop (≥768px) | 2 colunas | grid 2×3 | grid 3×2 |
| Mobile (<768px) | 1 coluna (capa topo) | 1 coluna | 1 coluna |

---

## Acessibilidade

- Todos os botões com `target="_blank"` incluem `rel="noopener noreferrer"`
- Imagens decorativas com `aria-hidden="true"`
- Capa do ebook com `alt` descritivo
- Contraste de texto ≥ 4.5:1 em todas as seções
- Animações `.fade-up` respeitam `prefers-reduced-motion` (já implementado no site)

---

## JavaScript

Reutilizar o `js/main.js` existente para `.fade-up` observer. Nenhum JS adicional necessário.

---

## Fora do escopo

- Checkout embutido (usa Kiwify externo)
- Depoimentos (sem conteúdo disponível no momento)
- Vídeo de apresentação
- Countdown timer / urgência artificial
