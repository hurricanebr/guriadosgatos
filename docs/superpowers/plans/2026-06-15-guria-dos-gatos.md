# Guria dos Gatos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, SEO-optimized landing page in Brazilian Portuguese for the Guria dos Gatos cat sitter service in Porto Alegre.

**Architecture:** Three files — `index.html` (all markup), `css/style.css` (all styles, mobile-first), `js/main.js` (nav scroll, hamburger, FAQ accordion, IntersectionObserver animations). No build step, no dependencies, deploys with drag-and-drop.

**Tech Stack:** HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript ES6+, Google Fonts (Dancing Script + Nunito).

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | Full page markup — all 11 sections, SEO meta, OG tags |
| `css/style.css` | Custom properties, reset, all component styles, animations, responsive |
| `js/main.js` | Nav scroll blur, hamburger toggle, FAQ accordion, IntersectionObserver |
| `logo-avatar.png` | Logo/hero illustration (already present in root) |
| `og-image.png` | Open Graph preview image (already present in root) |

---

## Task 1: HTML Boilerplate + SEO Head

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` with complete head section**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guria dos Gatos | Cat Sitter em Porto Alegre – RS</title>
  <meta name="description" content="Cat sitter domiciliar em Porto Alegre. Cuidamos do seu gato na casa dele com amor, responsabilidade e fotos todo dia. Agende sua visita!">
  <meta name="keywords" content="cat sitter Porto Alegre, cuidador de gatos Porto Alegre, cat sitting Porto Alegre RS, babá de gatos POA">
  <meta name="author" content="Guria dos Gatos">

  <!-- Open Graph -->
  <meta property="og:title" content="Guria dos Gatos | Cat Sitter em Porto Alegre – RS">
  <meta property="og:description" content="Cat sitter domiciliar em Porto Alegre. Seu gato em casa, feliz e seguro.">
  <meta property="og:image" content="og-image.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://guriadosgatos.com.br/">
  <meta property="og:locale" content="pt_BR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Guria dos Gatos | Cat Sitter em Porto Alegre">
  <meta name="twitter:description" content="Cat sitter domiciliar em Porto Alegre. Seu gato em casa, feliz e seguro.">
  <meta name="twitter:image" content="og-image.png">

  <link rel="canonical" href="https://guriadosgatos.com.br/">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- NAV placeholder — replaced in Task 3 -->

  <main>
    <!-- sections added per task -->
  </main>

  <!-- FOOTER placeholder — replaced in Task 11 -->

  <script src="js/main.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Open `index.html` in browser and verify it loads without errors (blank page with correct title in tab)**

---

## Task 2: CSS Foundation

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: Create `css/style.css` with custom properties, reset, typography and utility classes**

```css
/* ===========================
   CUSTOM PROPERTIES
   =========================== */
:root {
  --color-primary:       #4444A4;
  --color-primary-dark:  #33338A;
  --color-accent:        #FFB8C6;
  --color-bg:            #FDFBFF;
  --color-card:          #FFFFFF;
  --color-text:          #2D2D2D;
  --color-text-light:    #666666;
  --color-whatsapp:      #25D366;
  --color-whatsapp-dark: #1DA851;
  --font-heading: 'Dancing Script', cursive;
  --font-body:    'Nunito', sans-serif;
  --radius:    16px;
  --radius-sm: 8px;
  --shadow:    0 4px 20px rgba(68, 68, 164, 0.08);
  --shadow-lg: 0 8px 32px rgba(68, 68, 164, 0.15);
  --transition: 0.3s ease;
  --container: 1200px;
}

/* ===========================
   RESET
   =========================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; height: auto; display: block; }
ul { list-style: none; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; background: none; font-family: var(--font-body); }

/* ===========================
   TYPOGRAPHY
   =========================== */
h1 {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 6vw, 4rem);
  color: var(--color-primary);
  line-height: 1.15;
}
h1 span { color: var(--color-primary-dark); }
h2 {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: var(--color-primary);
  line-height: 1.2;
}
h3 { font-size: 1.1rem; font-weight: 700; color: var(--color-text); line-height: 1.3; }
p  { color: var(--color-text-light); }

/* ===========================
   UTILITIES
   =========================== */
.container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section { padding: 5rem 0; }
.section--alt { background-color: #F5F3FF; }

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}
.section-header p {
  font-size: 1.1rem;
  margin-top: 0.75rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* ===========================
   BUTTONS
   =========================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 50px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition), background-color var(--transition), color var(--transition);
  min-height: 48px;
}
.btn:hover { transform: scale(1.03); }

.btn--primary {
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 4px 15px rgba(68, 68, 164, 0.3);
}
.btn--primary:hover {
  background-color: var(--color-primary-dark);
  box-shadow: 0 6px 20px rgba(68, 68, 164, 0.4);
}

.btn--whatsapp {
  background-color: var(--color-whatsapp);
  color: #fff;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}
.btn--whatsapp:hover {
  background-color: var(--color-whatsapp-dark);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

.btn--outline {
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  background: transparent;
}
.btn--outline:hover { background-color: var(--color-primary); color: #fff; }

.btn--white {
  background-color: #fff;
  color: var(--color-primary);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.btn--white:hover { box-shadow: 0 6px 25px rgba(0,0,0,0.15); }

.btn--lg   { padding: 1rem 2.5rem; font-size: 1.1rem; }
.btn--full { width: 100%; }

/* ===========================
   BADGE
   =========================== */
.badge {
  display: inline-block;
  background-color: #EEE8FF;
  color: var(--color-primary);
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* ===========================
   CARD
   =========================== */
.card {
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  border-top: 4px solid var(--color-primary);
  transition: transform var(--transition), box-shadow var(--transition);
}
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

/* ===========================
   ANIMATIONS
   =========================== */
.fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-up.visible { opacity: 1; transform: translateY(0); }
.fade-up:nth-child(2) { transition-delay: 0.1s; }
.fade-up:nth-child(3) { transition-delay: 0.2s; }
.fade-up:nth-child(4) { transition-delay: 0.3s; }
```

- [ ] **Step 2: Verify page still loads without CSS errors (open browser dev tools → Console tab, should be empty)**

---

## Task 3: Navigation

**Files:**
- Modify: `index.html` — replace `<!-- NAV placeholder -->` comment
- Modify: `css/style.css` — append nav styles

- [ ] **Step 1: Replace the NAV comment in `index.html` with:**

```html
<header>
  <nav class="nav" id="nav" role="navigation" aria-label="Navegação principal">
    <div class="nav__container">

      <a href="#" class="nav__logo" aria-label="Guria dos Gatos — página inicial">
        <img src="logo-avatar.png" alt="Logo Guria dos Gatos" class="nav__logo-img" width="44" height="44">
        <span class="nav__logo-text">Guria dos Gatos</span>
      </a>

      <button class="nav__hamburger" id="hamburger" aria-label="Abrir menu de navegação" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav__links" id="nav-links" role="list">
        <li><a href="#servicos">Serviços</a></li>
        <li><a href="#como-funciona">Como Funciona</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#area">Área</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li class="nav__cta--mobile">
          <a href="https://wa.me/5551992441448?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20cat%20sitting%20da%20Guria%20dos%20Gatos"
             class="btn btn--whatsapp btn--full" target="_blank" rel="noopener noreferrer">
            📱 WhatsApp
          </a>
        </li>
      </ul>

      <a href="https://wa.me/5551992441448?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20cat%20sitting%20da%20Guria%20dos%20Gatos"
         class="btn btn--whatsapp nav__cta" target="_blank" rel="noopener noreferrer">
        📱 WhatsApp
      </a>

    </div>
  </nav>
</header>
```

- [ ] **Step 2: Append nav styles to `css/style.css`:**

```css
/* ===========================
   NAV
   =========================== */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 0.875rem 0;
  transition: background-color var(--transition), box-shadow var(--transition);
}
.nav.scrolled {
  background-color: rgba(253, 251, 255, 0.93);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 20px rgba(68, 68, 164, 0.1);
}

.nav__container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav__logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}
.nav__logo-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--color-accent);
}
.nav__logo-text {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  white-space: nowrap;
}

.nav__links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-left: auto;
}
.nav__links a {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: color var(--transition);
}
.nav__links a:hover { color: var(--color-primary); }
.nav__cta--mobile { display: none; }

.nav__cta {
  flex-shrink: 0;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}

.nav__hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 0.5rem;
  margin-left: auto;
}
.nav__hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 2px;
  transition: transform var(--transition), opacity var(--transition);
}
.nav__hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav__hamburger.open span:nth-child(2) { opacity: 0; }
.nav__hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile nav */
@media (max-width: 767px) {
  .nav__hamburger { display: flex; }
  .nav__cta { display: none; }
  .nav__links {
    display: none;
    position: fixed;
    top: 68px; left: 0; right: 0;
    background: rgba(253, 251, 255, 0.98);
    backdrop-filter: blur(12px);
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    z-index: 999;
  }
  .nav__links.open { display: flex; }
  .nav__cta--mobile { display: block; width: 100%; }
}
```

- [ ] **Step 3: Open `index.html` in browser, verify logo + links appear; resize to mobile and verify hamburger icon shows**

---

## Task 4: Hero Section

**Files:**
- Modify: `index.html` — add section inside `<main>`
- Modify: `css/style.css` — append hero styles

- [ ] **Step 1: Add hero section inside `<main>` in `index.html`:**

```html
<section id="hero" class="hero" aria-label="Apresentação">
  <div class="container hero__container">

    <div class="hero__content">
      <span class="hero__badge">🐱 Cat Sitter em Porto Alegre – RS</span>
      <h1 class="hero__title">
        Seu gato em casa,<br>
        <span>feliz e seguro.</span>
      </h1>
      <p class="hero__subtitle">
        Cat sitter domiciliar em Porto Alegre. A gente vai até você e cuida do
        seu gatinho com amor, responsabilidade e relatório diário com fotos.
      </p>
      <div class="hero__ctas">
        <a href="https://wa.me/5551992441448?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20cat%20sitting%20da%20Guria%20dos%20Gatos"
           class="btn btn--whatsapp" target="_blank" rel="noopener noreferrer">
          📱 Agendar pelo WhatsApp
        </a>
        <a href="#como-funciona" class="btn btn--outline">Como funciona ↓</a>
      </div>
    </div>

    <div class="hero__image" aria-hidden="true">
      <img src="logo-avatar.png"
           alt="Ilustração da Guria dos Gatos — cat sitter em Porto Alegre"
           width="420" height="420">
    </div>

  </div>
</section>
```

- [ ] **Step 2: Append hero styles to `css/style.css`:**

```css
/* ===========================
   HERO
   =========================== */
.hero {
  padding: 8rem 0 5rem;
  background: linear-gradient(135deg, #FDFBFF 0%, #EEE8FF 100%);
  overflow: hidden;
}
.hero__container {
  display: flex;
  align-items: center;
  gap: 4rem;
}
.hero__content { flex: 1; min-width: 0; }

.hero__badge {
  display: inline-block;
  background-color: var(--color-accent);
  color: var(--color-primary-dark);
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}
.hero__title { margin-bottom: 1.25rem; }
.hero__subtitle {
  font-size: 1.15rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 540px;
}
.hero__ctas { display: flex; gap: 1rem; flex-wrap: wrap; }

.hero__image { flex-shrink: 0; width: 380px; }
.hero__image img {
  width: 100%;
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  background-color: var(--color-accent);
}

@media (max-width: 1024px) {
  .hero__image { width: 300px; }
}
@media (max-width: 767px) {
  .hero { padding: 7rem 0 4rem; }
  .hero__container { flex-direction: column-reverse; gap: 2rem; text-align: center; }
  .hero__image { width: 200px; margin: 0 auto; }
  .hero__subtitle { max-width: 100%; }
  .hero__ctas { justify-content: center; flex-direction: column; align-items: center; }
  .hero__ctas .btn { width: 100%; max-width: 320px; }
}
```

- [ ] **Step 3: Reload browser — verify hero with illustration on right (desktop) or top (mobile), headline, and both CTA buttons**

---

## Task 5: Benefícios Section

**Files:**
- Modify: `index.html` — add section after `#hero`
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add benefits section after hero in `index.html`:**

```html
<section id="beneficios" class="section" aria-labelledby="beneficios-title">
  <div class="container">
    <div class="section-header">
      <h2 id="beneficios-title">Por que cat sitting domiciliar?</h2>
      <p>Seu gato fica no conforto da casa dele, sem estresse e sem trauma.</p>
    </div>
    <div class="beneficios__grid">

      <div class="card fade-up">
        <div class="card__icon" aria-hidden="true">🏠</div>
        <h3>Sem estresse de viagem</h3>
        <p>Seu gato fica no território dele, sem trauma de transporte nem ambiente desconhecido.</p>
      </div>

      <div class="card fade-up">
        <div class="card__icon" aria-hidden="true">⏰</div>
        <h3>Rotina preservada</h3>
        <p>Horários de comida, brincadeiras e sonecas mantidos exatamente como ele gosta.</p>
      </div>

      <div class="card fade-up">
        <div class="card__icon" aria-hidden="true">📱</div>
        <h3>Fotos e vídeos todo dia</h3>
        <p>Você viaja tranquila e acompanha tudo pelo WhatsApp. Nenhum momento perdido.</p>
      </div>

      <div class="card fade-up">
        <div class="card__icon" aria-hidden="true">📋</div>
        <h3>Atendimento personalizado</h3>
        <p>Ficha de cuidados individual para cada gatinho — rotina, alimentação e medicamentos.</p>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Append benefits styles to `css/style.css`:**

```css
/* ===========================
   BENEFÍCIOS
   =========================== */
.beneficios__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.card__icon { font-size: 2.5rem; margin-bottom: 1rem; }
.card h3 { color: var(--color-primary); margin-bottom: 0.625rem; }
```

- [ ] **Step 3: Reload browser — verify 4 cards appear in a row (desktop) and stack on mobile**

---

## Task 6: Como Funciona Section

**Files:**
- Modify: `index.html` — add section after benefícios
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add steps section to `index.html`:**

```html
<section id="como-funciona" class="section section--alt" aria-labelledby="como-title">
  <div class="container">
    <div class="section-header">
      <h2 id="como-title">Como Funciona</h2>
      <p>Simples, seguro e tranquilo para você e seu gatinho.</p>
    </div>
    <div class="steps" role="list">

      <div class="step fade-up" role="listitem">
        <div class="step__number" aria-hidden="true">1</div>
        <div class="step__content">
          <h3>Primeiro contato</h3>
          <p>Manda mensagem no WhatsApp, conta sobre seu gatinho e a data que precisa. Tiramos todas as dúvidas.</p>
        </div>
      </div>

      <div class="step__arrow" aria-hidden="true">→</div>

      <div class="step fade-up" role="listitem">
        <div class="step__number" aria-hidden="true">2</div>
        <div class="step__content">
          <h3>Visita de apresentação</h3>
          <p>A gente vai até você, conhece o gato e preenchemos a ficha de cuidados juntos, com calma.</p>
        </div>
      </div>

      <div class="step__arrow" aria-hidden="true">→</div>

      <div class="step fade-up" role="listitem">
        <div class="step__number" aria-hidden="true">3</div>
        <div class="step__content">
          <h3>Visitas com relatório diário</h3>
          <p>Cada visita tem foto e vídeo enviados pelo WhatsApp. Você acompanha tudo em tempo real.</p>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Append steps styles to `css/style.css`:**

```css
/* ===========================
   COMO FUNCIONA
   =========================== */
.steps {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step {
  flex: 1;
  min-width: 220px;
  max-width: 300px;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--color-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.step__number {
  width: 56px;
  height: 56px;
  background-color: var(--color-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1.25rem;
}
.step__content h3 { color: var(--color-primary); margin-bottom: 0.5rem; }
.step__arrow {
  font-size: 2rem;
  color: var(--color-accent);
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .steps { flex-direction: column; align-items: stretch; }
  .step { max-width: 100%; }
  .step__arrow { transform: rotate(90deg); text-align: center; }
}
```

- [ ] **Step 3: Reload — verify 3 steps with arrows on desktop, vertical stack on mobile**

---

## Task 7: Serviços Section

**Files:**
- Modify: `index.html` — add section after como-funciona
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add services section to `index.html`:**

```html
<section id="servicos" class="section" aria-labelledby="servicos-title">
  <div class="container servicos__container">
    <div class="section-header">
      <h2 id="servicos-title">Serviços</h2>
      <p>Cuidado profissional e amoroso para o seu gato, na casa dele.</p>
    </div>

    <div class="servico-card fade-up">
      <div class="servico-card__badge">⭐ Mais pedido</div>
      <h3 class="servico-card__title">Visita Domiciliar</h3>
      <p class="servico-card__duration">⏱ 1 hora de cuidado exclusivo</p>
      <div class="servico-card__price">
        R$&nbsp;75
        <span>/visita</span>
      </div>
      <ul class="servico-card__list" role="list">
        <li>✓ Alimentação e água fresca</li>
        <li>✓ Administração de medicamentos</li>
        <li>✓ Limpeza da caixinha de areia</li>
        <li>✓ Brincadeiras e carinho</li>
        <li>✓ Relatório com fotos e vídeos via WhatsApp</li>
      </ul>
      <a href="https://wa.me/5551992441448?text=Olá!%20Quero%20agendar%20uma%20visita%20domiciliar!"
         class="btn btn--primary btn--full" target="_blank" rel="noopener noreferrer">
        Agendar pelo WhatsApp
      </a>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Append services styles to `css/style.css`:**

```css
/* ===========================
   SERVIÇOS
   =========================== */
.servicos__container { max-width: 480px; }

.servico-card {
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--color-primary);
  position: relative;
  text-align: center;
}
.servico-card__badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-accent);
  color: var(--color-primary-dark);
  padding: 0.3rem 1.5rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}
.servico-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.servico-card__duration {
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}
.servico-card__price {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 1.5rem;
}
.servico-card__price span {
  font-size: 1.2rem;
  color: var(--color-text-light);
  font-weight: 400;
}
.servico-card__list {
  text-align: left;
  margin-bottom: 2rem;
}
.servico-card__list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #F0EEFF;
  font-weight: 600;
  color: var(--color-text);
}
.servico-card__list li:last-child { border-bottom: none; }
```

- [ ] **Step 3: Reload — verify service card is centered with badge, price R$75, checklist, and WhatsApp button**

---

## Task 8: Sobre + Área de Atendimento Sections

**Files:**
- Modify: `index.html` — add two sections after serviços
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add "Sobre" section to `index.html`:**

```html
<section id="sobre" class="section section--alt" aria-labelledby="sobre-title">
  <div class="container sobre__container">

    <div class="sobre__image fade-up">
      <img src="logo-avatar.png"
           alt="Cuidadora da Guria dos Gatos com seus gatinhos"
           width="320" height="320">
    </div>

    <div class="sobre__content fade-up">
      <h2 id="sobre-title">Sobre a Guria dos Gatos</h2>

      <!-- TEXTO DA CUIDADORA — substitua pelo texto real da Maitê/equipe -->
      <p>
        Olá! Somos a Guria dos Gatos, uma equipe de cat sitters apaixonadas por felinos
        em Porto Alegre. Sabemos que deixar seu gatinho é sempre uma decisão difícil —
        por isso tratamos cada pet como se fosse nosso.
      </p>
      <p>
        Com anos de experiência em cuidar de gatos com necessidades especiais,
        administração de medicamentos e muito carinho, nossa missão é que você viaje
        tranquila sabendo que seu bichinho está em boas mãos.
      </p>
      <!-- FIM DO TEXTO DA CUIDADORA -->

      <div class="sobre__badges">
        <span class="badge">🐾 Amantes de gatos</span>
        <span class="badge">💊 Experiência com medicamentos</span>
        <span class="badge">📋 Ficha de cuidados</span>
        <span class="badge">🔒 Discrição e responsabilidade</span>
      </div>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Add "Área de Atendimento" section to `index.html` (after sobre):**

```html
<section id="area" class="section" aria-labelledby="area-title">
  <div class="container">
    <div class="section-header">
      <h2 id="area-title">Área de Atendimento</h2>
      <p>Atendemos em Porto Alegre – RS</p>
    </div>
    <div class="area__container">

      <div class="area__bairros fade-up">
        <h3>Bairros atendidos</h3>
        <!-- ADICIONAR BAIRROS REAIS — substitua a lista abaixo -->
        <ul class="area__list" role="list">
          <li>Moinhos de Vento</li>
          <li>Petrópolis</li>
          <li>Bela Vista</li>
          <li>Independência</li>
          <li>Auxiliadora</li>
          <li>Mont'Serrat</li>
          <li>Higienópolis</li>
          <li>Três Figueiras</li>
        </ul>
        <!-- FIM BAIRROS -->
        <p class="area__note">
          Não encontrou seu bairro?
          <a href="https://wa.me/5551992441448?text=Olá!%20Gostaria%20de%20saber%20se%20atendem%20no%20meu%20bairro"
             target="_blank" rel="noopener noreferrer">Entre em contato</a>
          — podemos verificar a disponibilidade.
        </p>
      </div>

      <div class="area__mapa fade-up">
        <!-- EMBED GOOGLE MAPS — substitua pelo iframe real do Google Maps -->
        <div class="area__mapa-placeholder" role="img" aria-label="Mapa de Porto Alegre RS">
          <span style="font-size:2.5rem">🗺️</span>
          <p style="color:var(--color-primary);font-weight:700">Porto Alegre – RS</p>
          <small>Substitua esta div pelo iframe do Google Maps</small>
        </div>
        <!-- FIM GOOGLE MAPS -->
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 3: Append Sobre + Área styles to `css/style.css`:**

```css
/* ===========================
   SOBRE
   =========================== */
.sobre__container {
  display: flex;
  align-items: center;
  gap: 4rem;
}
.sobre__image { flex-shrink: 0; width: 320px; }
.sobre__image img {
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  background-color: var(--color-accent);
}
.sobre__content { flex: 1; }
.sobre__content h2 { margin-bottom: 1.25rem; }
.sobre__content p { margin-bottom: 1rem; font-size: 1.05rem; line-height: 1.8; }
.sobre__badges { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }

@media (max-width: 767px) {
  .sobre__container { flex-direction: column; text-align: center; }
  .sobre__image { width: 200px; margin: 0 auto; }
  .sobre__badges { justify-content: center; }
}

/* ===========================
   ÁREA DE ATENDIMENTO
   =========================== */
.area__container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
.area__bairros h3 { font-size: 1.25rem; color: var(--color-primary); margin-bottom: 1rem; }
.area__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem 1rem;
  margin-bottom: 1.25rem;
}
.area__list li {
  font-weight: 600;
  color: var(--color-text);
  padding: 0.3rem 0;
}
.area__list li::before { content: "📍 "; }
.area__note { font-size: 0.9rem; }
.area__note a { color: var(--color-primary); font-weight: 600; text-decoration: underline; }

.area__mapa { border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
.area__mapa iframe { width: 100%; height: 320px; border: 0; display: block; }
.area__mapa-placeholder {
  background: #EEE8FF;
  border-radius: var(--radius);
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 767px) {
  .area__container { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Reload — verify Sobre with illustration left and text right (or stacked on mobile); Área with two-column layout**

---

## Task 9: Depoimentos Section

**Files:**
- Modify: `index.html` — add section after área
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add testimonials section to `index.html`:**

```html
<section id="depoimentos" class="section section--alt" aria-labelledby="depoimentos-title">
  <div class="container">
    <div class="section-header">
      <h2 id="depoimentos-title">O que dizem nossos clientes</h2>
      <p>Avaliações reais de tutores de Porto Alegre no Google.</p>
    </div>
    <div class="depoimentos__grid">

      <article class="depoimento-card fade-up">
        <div class="depoimento-card__stars" aria-label="5 estrelas">★★★★★</div>
        <blockquote class="depoimento-card__text">
          Super recomendo! Fomos atendidos pela Jéssica, um doce de pessoa. Muito
          atenciosa e cuidadosa com meus filhos e com meu lar. Recomendo de olhos
          fechados!
        </blockquote>
        <footer class="depoimento-card__author">
          <strong>Bianca Vieira</strong>
          <span>Local Guide · Porto Alegre</span>
        </footer>
      </article>

      <article class="depoimento-card fade-up">
        <div class="depoimento-card__stars" aria-label="5 estrelas">★★★★★</div>
        <blockquote class="depoimento-card__text">
          Tive uma primeira experiência excelente com a Guria dos Gatos! Quem cuidou
          do meu gato foi a tia Maitê. Ela é muito atenciosa, carinhosa e tem bastante
          experiência em ministrar medicamentos, tudo o que o Gandalf precisava! Isso
          sem falar nas fotos e vídeos que ela manda, que são maravilhosos. Recomendo
          demais!
        </blockquote>
        <footer class="depoimento-card__author">
          <strong>Gabriela Boessio</strong>
          <span>Porto Alegre</span>
        </footer>
      </article>

      <article class="depoimento-card fade-up">
        <div class="depoimento-card__stars" aria-label="5 estrelas">★★★★★</div>
        <blockquote class="depoimento-card__text">
          Indico muito o trabalho delas! A cat sitter Maitê cuidou da minha gatinha
          idosa, dando soro subcutâneo e medicações, durante muitos meses com toda a
          paciência do mundo. Confio qualquer um dos meus gatinhos nas mãos das gurias
          da empresa, são profissionais maravilhosas, que conhecem bem os gatos e amam
          o que fazem!
        </blockquote>
        <footer class="depoimento-card__author">
          <strong>Renée Lima</strong>
          <span>Porto Alegre</span>
        </footer>
      </article>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Append testimonial styles to `css/style.css`:**

```css
/* ===========================
   DEPOIMENTOS
   =========================== */
.depoimentos__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.depoimento-card {
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.depoimento-card__stars {
  color: #FFB800;
  font-size: 1.1rem;
  letter-spacing: 2px;
}
.depoimento-card__text {
  font-style: italic;
  color: var(--color-text);
  line-height: 1.7;
  flex: 1;
  position: relative;
  padding-top: 0.5rem;
}
.depoimento-card__text::before {
  content: '"';
  font-family: var(--font-heading);
  font-size: 4rem;
  color: var(--color-accent);
  line-height: 0.8;
  display: block;
  margin-bottom: 0.25rem;
}
.depoimento-card__author {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-top: 1px solid #F0EEFF;
  padding-top: 0.75rem;
}
.depoimento-card__author strong { color: var(--color-primary); font-size: 0.95rem; }
.depoimento-card__author span   { font-size: 0.85rem; color: var(--color-text-light); }
```

- [ ] **Step 3: Reload — verify 3 testimonial cards with decorative quotes and star ratings**

---

## Task 10: FAQ Section

**Files:**
- Modify: `index.html` — add section after depoimentos
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add FAQ section to `index.html`:**

```html
<section id="faq" class="section" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-header">
      <h2 id="faq-title">Perguntas Frequentes</h2>
      <p>Tudo o que você precisa saber antes de agendar.</p>
    </div>
    <div class="faq__list">

      <div class="faq__item">
        <button class="faq__question" aria-expanded="false"
                aria-controls="faq-1">
          O que acontece em caso de emergência com meu gato?
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__answer" id="faq-1" role="region">
          <p>Em caso de emergência, entramos em contato imediatamente com você e, se necessário,
          levamos o pet ao veterinário de sua preferência ou indicamos uma clínica próxima.
          Por isso pedimos o contato do seu vet na ficha de cuidados.</p>
        </div>
      </div>

      <div class="faq__item">
        <button class="faq__question" aria-expanded="false"
                aria-controls="faq-2">
          Vocês atendem em feriados e fins de semana?
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__answer" id="faq-2" role="region">
          <p>Sim! Atendemos todos os dias da semana, incluindo feriados e fins de semana.
          Entre em contato para verificar a disponibilidade nas datas desejadas.</p>
        </div>
      </div>

      <div class="faq__item">
        <button class="faq__question" aria-expanded="false"
                aria-controls="faq-3">
          Cuidam de gatos com necessidades especiais ou que tomam remédio?
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__answer" id="faq-3" role="region">
          <p>Sim! Temos experiência com administração de medicamentos orais e soro subcutâneo.
          Todas as informações são registradas na ficha de cuidados antes do início do serviço.</p>
        </div>
      </div>

      <div class="faq__item">
        <button class="faq__question" aria-expanded="false"
                aria-controls="faq-4">
          Como recebo as atualizações durante as visitas?
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__answer" id="faq-4" role="region">
          <p>Em cada visita você recebe fotos e vídeos do seu gatinho diretamente pelo WhatsApp.
          Assim você acompanha tudo em tempo real, de onde estiver.</p>
        </div>
      </div>

      <div class="faq__item">
        <button class="faq__question" aria-expanded="false"
                aria-controls="faq-5">
          Tem contrato ou ficha de cuidados?
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__answer" id="faq-5" role="region">
          <p>Sim! Preenchemos juntos uma ficha de cuidados com rotina, alimentação, medicamentos,
          veterinário de preferência e contato de emergência. Isso garante segurança e
          tranquilidade para todos.</p>
        </div>
      </div>

      <div class="faq__item">
        <button class="faq__question" aria-expanded="false"
                aria-controls="faq-6">
          Qual é a área de atendimento exata?
          <span class="faq__icon" aria-hidden="true">+</span>
        </button>
        <div class="faq__answer" id="faq-6" role="region">
          <p>Atendemos em Porto Alegre – RS. Entre em contato pelo WhatsApp informando seu
          bairro para confirmar a disponibilidade na sua região.</p>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Append FAQ styles to `css/style.css`:**

```css
/* ===========================
   FAQ
   =========================== */
.faq__list {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.faq__item {
  background: var(--color-card);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.faq__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  transition: color var(--transition);
  min-height: 48px;
}
.faq__question:hover { color: var(--color-primary); }
.faq__item.open .faq__question { color: var(--color-primary); }

.faq__icon {
  font-size: 1.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
  font-weight: 300;
  line-height: 1;
  transition: transform var(--transition);
}
.faq__item.open .faq__icon { transform: rotate(45deg); }

.faq__answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.faq__answer p {
  padding: 0 1.5rem 1.25rem;
  line-height: 1.7;
}
```

- [ ] **Step 3: Reload — verify FAQ accordion renders with 6 questions (answers hidden; JS will be wired in Task 12)**

---

## Task 11: CTA Banner + Footer

**Files:**
- Modify: `index.html` — add CTA section + footer (after FAQ, before `</body>`)
- Modify: `css/style.css` — append styles

- [ ] **Step 1: Add CTA banner and footer to `index.html`** (replace `<!-- FOOTER placeholder -->` and add after `</main>`):

```html
  </main><!-- close main -->

  <section class="cta-banner" aria-labelledby="cta-title">
    <div class="container cta-banner__container">
      <h2 id="cta-title">Pronto para deixar seu gatinho em boas mãos?</h2>
      <p>Entre em contato e agende a visita de apresentação.</p>
      <a href="https://wa.me/5551992441448?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20cat%20sitting%20da%20Guria%20dos%20Gatos"
         class="btn btn--white btn--lg" target="_blank" rel="noopener noreferrer">
        📱 Falar com a Guria dos Gatos no WhatsApp
      </a>
    </div>
  </section>

  <footer id="contato" class="footer" role="contentinfo">
    <div class="container footer__container">

      <div class="footer__brand">
        <img src="logo-avatar.png" alt="Logo Guria dos Gatos"
             class="footer__logo" width="60" height="60">
        <span class="footer__name">Guria dos Gatos</span>
        <p class="footer__tagline">Cat Sitter em Porto Alegre – RS</p>
      </div>

      <nav class="footer__links" aria-label="Links rápidos">
        <h4>Links rápidos</h4>
        <ul role="list">
          <li><a href="#servicos">Serviços</a></li>
          <li><a href="#como-funciona">Como Funciona</a></li>
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#area">Área de Atendimento</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </nav>

      <div class="footer__contact">
        <h4>Contato</h4>
        <ul role="list">
          <li>
            <a href="https://wa.me/5551992441448" target="_blank" rel="noopener noreferrer">
              📱 (51) 99244-1448
            </a>
          </li>
          <li>
            <a href="mailto:guriadosgatos.com@gmail.com">
              ✉️ guriadosgatos.com@gmail.com
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/guria.dosgatos/"
               target="_blank" rel="noopener noreferrer">
              📸 @guria.dosgatos
            </a>
          </li>
          <li>
            <a href="https://web.facebook.com/guriadosgatos/"
               target="_blank" rel="noopener noreferrer">
              📘 /guriadosgatos
            </a>
          </li>
        </ul>
      </div>

    </div>
    <div class="footer__bottom">
      <p>© 2026 Guria dos Gatos · Cat Sitter em Porto Alegre – RS · Todos os direitos reservados</p>
    </div>
  </footer>
```

- [ ] **Step 2: Append CTA + Footer styles to `css/style.css`:**

```css
/* ===========================
   CTA BANNER
   =========================== */
.cta-banner {
  background-color: var(--color-primary);
  padding: 5rem 0;
  text-align: center;
}
.cta-banner__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.cta-banner h2 { color: #fff; }
.cta-banner p  { color: rgba(255,255,255,0.85); font-size: 1.1rem; }

/* ===========================
   FOOTER
   =========================== */
.footer {
  background-color: #1A1A3E;
  color: rgba(255,255,255,0.85);
  padding: 4rem 0 0;
}
.footer__container {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 3rem;
  padding-bottom: 3rem;
}
.footer__brand { display: flex; flex-direction: column; gap: 0.625rem; }
.footer__logo  { border-radius: 50%; object-fit: cover; background-color: var(--color-accent); }
.footer__name  { font-family: var(--font-heading); font-size: 1.5rem; color: #fff; }
.footer__tagline { font-size: 0.875rem; color: rgba(255,255,255,0.55); }

.footer__links h4,
.footer__contact h4 {
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}
.footer__links ul,
.footer__contact ul {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.footer__links a,
.footer__contact a {
  color: rgba(255,255,255,0.65);
  font-size: 0.9rem;
  transition: color var(--transition);
}
.footer__links a:hover,
.footer__contact a:hover { color: var(--color-accent); }

.footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 1.25rem 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

@media (max-width: 1024px) {
  .footer__container { grid-template-columns: 1fr 1fr; }
  .footer__brand     { grid-column: 1 / -1; }
}
@media (max-width: 767px) {
  .footer__container { grid-template-columns: 1fr; gap: 2rem; }
}
```

- [ ] **Step 3: Reload — verify purple CTA banner and dark footer with 3-column layout (or stacked on mobile)**

---

## Task 12: JavaScript

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Create `js/main.js` with all interactive behaviors:**

```javascript
/* ===========================
   CONFIGURATION
   Edit these values to customize:
   =========================== */
const WHATSAPP_NUMBER = '5551992441448';
const WHATSAPP_MSG    = 'Olá!%20Quero%20saber%20mais%20sobre%20o%20cat%20sitting%20da%20Guria%20dos%20Gatos';

/* ===========================
   NAV — SCROLL BLUR
   =========================== */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===========================
   NAV — HAMBURGER MENU
   =========================== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ===========================
   FAQ — ACCORDION
   =========================== */
document.querySelectorAll('.faq__question').forEach(button => {
  button.addEventListener('click', () => {
    const item   = button.closest('.faq__item');
    const answer = item.querySelector('.faq__answer');
    const isOpen = item.classList.contains('open');

    // Close all open items
    document.querySelectorAll('.faq__item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq__answer').style.maxHeight = null;
      openItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });

    // Open the clicked item (if it was closed)
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ===========================
   INTERSECTION OBSERVER — FADE UP
   =========================== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
```

- [ ] **Step 2: Reload browser and verify:**
  - Scroll down → nav gains blur/shadow at 20px scroll
  - Resize to mobile → hamburger shows; click it → nav slides open; click a link → nav closes
  - Click any FAQ question → answer expands; click another → previous closes
  - Scroll through sections → cards animate in with fade-up

---

## Task 13: Final Checks + Mobile Polish

**Files:**
- Modify: `css/style.css` — add missing responsive gaps if needed

- [ ] **Step 1: Open browser DevTools → toggle device toolbar → test at 375px (iPhone SE)**
  - Nav: hamburger + logo only visible; WhatsApp button accessible in expanded menu
  - Hero: illustration on top, text below, CTAs full-width and stacked
  - Benefits: 1 column
  - Steps: vertical with ↓ arrow
  - Service card: full width, readable price
  - Sobre: illustration centered above text
  - Area: single column
  - Testimonials: single column
  - FAQ: full width items, tap target ≥ 48px
  - CTA banner: text centered, button full-width
  - Footer: single column

- [ ] **Step 2: Test at 768px (tablet)**
  - Benefits: 2 columns
  - Testimonials: 2 columns
  - Footer: 2 columns

- [ ] **Step 3: Test at 1280px (desktop)**
  - Hero: image on right
  - Benefits: 4 columns
  - Steps: horizontal
  - Testimonials: 3 columns
  - Footer: 3 columns

- [ ] **Step 4: Test all CTA links**
  - Nav WhatsApp button → opens `wa.me/5551992441448`
  - Hero "Agendar pelo WhatsApp" → same
  - Service card button → opens with different pre-filled message
  - CTA banner button → opens WhatsApp
  - Footer phone link → opens dialer on mobile
  - Footer email → opens mail client
  - Instagram → `instagram.com/guria.dosgatos/`
  - Facebook → `facebook.com/guriadosgatos/`

- [ ] **Step 5: Verify page `<title>` and meta description in browser tab and DevTools → Elements → `<head>`**

- [ ] **Step 6: Run a quick accessibility check — Tab through the page and verify every interactive element (nav links, buttons, FAQ items) receives visible focus**

---

## Placeholders Remaining (substitute before launch)

| Placeholder | Location | What to put |
|---|---|---|
| Texto da cuidadora | `index.html` — `<!-- TEXTO DA CUIDADORA -->` | Bio real da Maitê/equipe |
| Bairros atendidos | `index.html` — `<!-- ADICIONAR BAIRROS REAIS -->` | Lista de bairros reais |
| Google Maps embed | `index.html` — `<!-- EMBED GOOGLE MAPS -->` | `<iframe src="https://maps.google.com/maps?...">` |
| URL canônica | `index.html` `<link rel="canonical">` + OG url | Domínio real |
| Visita de apresentação | CTA banner copy | Confirmar se é gratuita e atualizar o texto |

## Customization Quick Reference

| O que mudar | Onde |
|---|---|
| Cor principal | `--color-primary` em `css/style.css` linha 4 |
| WhatsApp | `WHATSAPP_NUMBER` em `js/main.js` linha 4 |
| Nome da marca | `<title>`, `.nav__logo-text`, `.footer__name` em `index.html` |
| Logo/ilustração | Substituir `logo-avatar.png` na raiz |
| OG image | Substituir `og-image.png` na raiz |
