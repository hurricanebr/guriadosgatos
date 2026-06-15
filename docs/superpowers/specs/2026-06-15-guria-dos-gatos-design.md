# Design Spec — Guria dos Gatos Website

**Data:** 2026-06-15  
**Status:** Aprovado pelo usuário  
**Stack:** HTML puro + CSS + JavaScript vanilla

---

## 1. Contexto do Negócio

| Campo | Valor |
|---|---|
| Nome da marca | Guria dos Gatos |
| Serviço | Cat sitter domiciliar (cat sitters vão à casa do cliente) |
| Serviço único | Visita domiciliar de 1 hora |
| Preço | R$ 75 por visita |
| Região | Porto Alegre – RS |
| WhatsApp | (51) 99244-1448 |
| Email | guriadosgatos.com@gmail.com |
| Instagram | https://www.instagram.com/guria.dosgatos/ |
| Facebook | https://web.facebook.com/guriadosgatos/ |
| Link WhatsApp | `https://wa.me/5551992441448?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20cat%20sitting%20da%20Guria%20dos%20Gatos` |

---

## 2. Identidade Visual

### Paleta de Cores (CSS custom properties)

```css
--color-primary:       #4444A4;   /* roxo principal — botões, headings, nav */
--color-primary-dark:  #33338A;   /* hover de botões */
--color-accent:        #FFB8C6;   /* rosa — badges, bordas, detalhes */
--color-bg:            #FDFBFF;   /* fundo da página */
--color-card:          #FFFFFF;   /* fundo de cards */
--color-text:          #2D2D2D;   /* corpo do texto */
--color-text-light:    #666666;   /* subtítulos e textos secundários */
```

### Tipografia

- **Headings / nome da marca:** `Dancing Script` (Google Fonts) — script handwritten, casa com a ilustração aquarelada
- **Corpo / UI:** `Nunito` (Google Fonts) — arredondado, acolhedor, excelente legibilidade mobile

### Logo

- Ilustração aquarelada da menina com gatos (arquivo: `assets/logo-avatar.png`)
- Texto "Guria dos Gatos" em Dancing Script ao lado
- No banner/header: fundo roxo `#4444A4` + texto branco

---

## 3. Estrutura de Arquivos

```
catsitter/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── logo-avatar.png          ← ilustração da menina (já presente na raiz)
└── og-image.png             ← imagem para Open Graph (já presente na raiz)
```

---

## 4. Seções da Página (ordem)

### 4.1 `<nav>` — Navegação Principal
- Logo (ilustração pequena + "Guria dos Gatos" em Dancing Script)
- Links âncora: Serviços · Como Funciona · Sobre · Área · Contato
- Botão CTA: "Fale no WhatsApp" (verde, `#25D366`)
- Comportamento: sticky, `backdrop-filter: blur(8px)` + sombra sutil ao rolar
- Mobile: hamburger menu, menu lateral ou dropdown

### 4.2 `<section id="hero">` — Hero
- **Headline (h1):** "Seu gato em casa, feliz e seguro."
- **Subtítulo:** "Cat sitter domiciliar em Porto Alegre. A gente vai até você!"
- **CTA primário:** botão WhatsApp verde — "Agendar pelo WhatsApp"
- **CTA secundário:** link âncora "Como funciona ↓"
- **Visual:** ilustração da menina à direita (desktop) / topo (mobile)
- Fundo: gradiente suave de `#FDFBFF` para `#EEE8FF`

### 4.3 `<section id="beneficios">` — Por que cat sitting domiciliar?
- **4 cards** com ícone SVG + título + parágrafo curto:
  1. Sem estresse de viagem — "Seu gato fica no território dele, sem trauma."
  2. Rotina preservada — "Horários de comida, brincadeiras e sonecas mantidos."
  3. Fotos e vídeos todo dia — "Você viaja tranquila e acompanha tudo pelo WhatsApp."
  4. Atendimento personalizado — "Ficha de cuidados individual para cada gatinho."
- Layout: 1 coluna (mobile) → 2 colunas (tablet) → 4 colunas (desktop)
- Cards com `border-radius: 16px`, sombra suave, borda superior roxa

### 4.4 `<section id="como-funciona">` — Como Funciona
- **3 passos** numerados (grande, roxo):
  1. **Primeiro contato** — "Manda mensagem no WhatsApp, conta sobre seu gatinho e a data que precisa."
  2. **Visita de apresentação** — "A gente vai até você, conhece o gato e preenche a ficha de cuidados juntos."
  3. **Visitas com relatório diário** — "Cada visita tem foto/vídeo enviado pelo WhatsApp. Você acompanha tudo."
- Layout: coluna vertical com linha conectora (mobile) → horizontal (desktop)

### 4.5 `<section id="servicos">` — Serviços
- **1 card central destacado:**
  - Título: "Visita Domiciliar"
  - Duração: 1 hora
  - Preço: **R$ 75 por visita**
  - Lista do que está incluído:
    - ✓ Alimentação e água fresca
    - ✓ Administração de medicamentos
    - ✓ Limpeza da caixinha de areia
    - ✓ Brincadeiras e carinho
    - ✓ Relatório com fotos/vídeos via WhatsApp
  - CTA: "Agendar pelo WhatsApp"

### 4.6 `<section id="sobre">` — Sobre a Guria
- Foto/ilustração da cuidadora
- Texto em primeira pessoa (placeholder marcado com `<!-- TEXTO DA CUIDADORA -->`)
- Destaques em badges roxos: "Amante de gatos" · "Responsável" · "Com experiência"
- Menção à ficha de cuidados e contrato como diferenciais de confiança

### 4.7 `<section id="area">` — Área de Atendimento
- Subtítulo: "Atendemos em Porto Alegre – RS"
- Lista de bairros (placeholder: `<!-- ADICIONAR BAIRROS REAIS -->`)
  - Exemplo: Moinhos de Vento, Petrópolis, Bela Vista, Independência, Auxiliadora, Mont'Serrat...
- Embed do Google Maps (placeholder `<!-- EMBED GOOGLE MAPS -->`)
- Nota: "Não encontrou seu bairro? Entre em contato — podemos verificar a disponibilidade."

### 4.8 `<section id="depoimentos">` — Depoimentos
- 3 cards com aspas decorativas em roxo, texto, nome, estrelas (5/5)
- Depoimentos reais do Google:

  **Card 1 — Bianca Vieira** (Local Guide)
  > "Super recomendo! Fomos atendidos pela Jéssica, um doce de pessoa. Muito atenciosa e cuidadosa com meus filhos e com meu lar. Recomendo de olhos fechados! ❤️"

  **Card 2 — Gabriela Boessio**
  > "Tive uma primeira experiência excelente com a Guria dos Gatos! Quem cuidou do meu gato foi a tia Maitê. Ela é muito atenciosa, carinhosa e tem bastante experiência em ministrar medicamentos, tudo o que o Gandalf precisava! Isso sem falar nas fotos e vídeos que ela manda, que são maravilhosos. Recomendo demais!"

  **Card 3 — Renée Lima**
  > "Indico muito o trabalho delas! A cat sitter Maitê cuidou da minha gatinha idosa, dando soro subcutâneo e medicações, durante muitos meses com toda a paciência do mundo. Confio qualquer um dos meus gatinhos nas mãos das gurias da empresa, são profissionais maravilhosas, que conhecem bem os gatos e amam o que fazem!"

### 4.9 `<section id="faq">` — Perguntas Frequentes
- Accordion (abertura com animação suave) com 6 itens:
  1. O que acontece em caso de emergência com meu gato?
  2. Vocês atendem em feriados e fins de semana?
  3. Cuidam de gatos com necessidades especiais ou que tomam remédio?
  4. Como recebo as atualizações durante as visitas?
  5. Tem contrato ou ficha de cuidados?
  6. Qual a área de atendimento exata?

### 4.10 `<section id="cta">` — Banner de Conversão
- Fundo: roxo sólido `#4444A4`
- Texto branco: "Pronto para deixar seu gatinho em boas mãos?"
- Subtexto: "Entre em contato e agende a visita de apresentação."
- Botão: "Falar com a Guria dos Gatos no WhatsApp" (grande, branco, texto roxo)

### 4.11 `<footer>` — Rodapé
- Logo pequeno
- Links rápidos (âncoras das seções)
- Ícones: Instagram, Facebook, WhatsApp
- Email e telefone
- Texto: "© 2026 Guria dos Gatos · Cat Sitter em Porto Alegre – RS"

---

## 5. UX & Responsividade

### Breakpoints
```css
/* Mobile first */
/* sm: 480px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
```

### Comportamentos Mobile
- Nav: hamburger (≤ 767px), botão WhatsApp sempre visível
- Hero: ilustração acima do texto, CTA centralizado
- Cards: 1 coluna → 2 → 4
- Como Funciona: vertical com seta ↓ entre passos
- Touch targets mínimos: 48px de altura

---

## 6. Animações (sem dependências externas)

- `fade-up` via `IntersectionObserver`: cards, seções, passos
- Accordion FAQ: altura transitada com `max-height` CSS
- Hover botões: `transform: scale(1.03)` + transição de cor
- Nav: `transition: background, box-shadow` ao rolar (scroll listener)
- Hamburger: animação de X com CSS puro

---

## 7. SEO

```html
<html lang="pt-BR">
<title>Guria dos Gatos | Cat Sitter em Porto Alegre – RS</title>
<meta name="description" content="Cat sitter domiciliar em Porto Alegre. Cuidamos do seu gato na casa dele, com fotos e vídeos todo dia. Agende sua visita!">
<meta property="og:title" content="Guria dos Gatos | Cat Sitter em Porto Alegre">
<meta property="og:description" content="Cat sitter domiciliar em Porto Alegre. Seu gato em casa, feliz e seguro.">
<meta property="og:image" content="assets/og-image.jpg">
<meta property="og:type" content="website">
<link rel="canonical" href="https://guriadosgatos.com.br/">
```

- HTML semântico: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<article>`
- `alt` descritivo em todas as imagens
- Headings hierárquicos: h1 no hero, h2 em cada seção, h3 nos cards
- Keywords locais: "cat sitter Porto Alegre", "cuidador de gatos Porto Alegre", "cat sitting Porto Alegre RS"

---

## 8. Customização (guia rápido)

| O que mudar | Onde mudar |
|---|---|
| Nome da marca | `<title>`, headings, footer em `index.html` |
| WhatsApp | Variável `WHATSAPP_LINK` no topo de `main.js` + `href` na nav |
| Cor principal | `--color-primary` em `style.css` (1 linha) |
| Bairros atendidos | Seção `#area` em `index.html` |
| Depoimentos | Cards com comentário `<!-- DEPOIMENTO REAL -->` |
| Texto da cuidadora | Bloco `<!-- TEXTO DA CUIDADORA -->` |
| Logo/ilustração | Substituir `assets/logo-avatar.png` |
| Mapa | Substituir iframe `<!-- EMBED GOOGLE MAPS -->` |

---

## 9. Placeholders a substituir antes do lançamento

- [x] `logo-avatar.png` — já presente na raiz do projeto
- [x] `og-image.png` — já presente na raiz do projeto
- [ ] Texto "Sobre a Guria" — bio em primeira pessoa
- [ ] Bairros atendidos — lista real
- [ ] Google Maps embed — iframe com localização real
- [x] 3 depoimentos reais (Bianca Vieira, Gabriela Boessio, Renée Lima)
- [ ] URL canônica — substituir `guriadosgatos.com.br` pelo domínio real (não confirmado)
- [ ] Visita de apresentação — confirmar se é gratuita ou tem custo, e atualizar o copy do CTA
