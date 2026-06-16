# GATIFIQUE-se Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `gatifique-se.html` — landing page standalone de alta conversão para o e-book "GATIFIQUE-se", herdando o design system do site principal.

**Architecture:** Página HTML+CSS estática. CSS adicionado ao final de `css/style.css` com prefixo `.ebook-`. JS mínimo em `js/ebook.js` (só fade-up observer). Nenhum framework externo.

**Tech Stack:** HTML5, CSS3 (variáveis CSS existentes), JS vanilla, fontes Google (já carregadas no site)

---

### Task 1: Criar `js/ebook.js` com fade-up observer

**Files:**
- Create: `js/ebook.js`

- [ ] **Step 1: Criar o arquivo**

Conteúdo completo de `js/ebook.js`:

```javascript
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

- [ ] **Step 2: Commit**

```bash
git add js/ebook.js
git commit -m "feat: adicionar js/ebook.js com fade-up observer para landing page do ebook"
```

---

### Task 2: Adicionar CSS do ebook ao `css/style.css`

**Files:**
- Modify: `css/style.css` (append ao final)

- [ ] **Step 1: Adicionar bloco de CSS ao final de `css/style.css`**

```css
/* ===========================
   EBOOK PAGE
   =========================== */

/* Header */
.ebook-header {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-primary-light);
  background: var(--color-bg);
  text-align: center;
}
.ebook-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}
.ebook-header__logo-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.ebook-header__logo-text {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
}

/* Hero */
.ebook-hero {
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
}
.ebook-hero__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.ebook-hero__badge { margin-bottom: 1rem; }
.ebook-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(3rem, 7vw, 5rem);
  color: var(--color-primary);
  line-height: 1.1;
  margin-bottom: 1rem;
}
.ebook-hero__subtitle {
  font-size: 1.2rem;
  color: var(--color-text-light);
  margin-bottom: 2rem;
  max-width: 480px;
}
.ebook-hero__price { margin-bottom: 2rem; }
.ebook-hero__price-label {
  font-size: 0.9rem;
  color: var(--color-text-light);
  display: block;
  margin-bottom: 0.25rem;
}
.ebook-hero__price-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}
.ebook-hero__img-wrap { position: relative; }
.ebook-hero__img {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  transform: rotate(-2deg);
  transition: transform var(--transition);
}
.ebook-hero__img:hover { transform: rotate(0deg) scale(1.02); }

/* Cat decos ebook */
.cat-deco--ebook-hero {
  position: absolute;
  bottom: -10px;
  right: -30px;
  width: 150px;
  pointer-events: none;
  z-index: 0;
}
.cat-deco--ebook-aprenda {
  position: absolute;
  bottom: -10px;
  left: -20px;
  width: 140px;
  pointer-events: none;
  z-index: 0;
  transform: scaleX(-1);
}
.cat-deco--ebook-autora {
  position: absolute;
  top: 50%;
  right: 3%;
  width: 120px;
  pointer-events: none;
  z-index: 0;
  transform: translateY(-50%);
}

/* Para quem é */
.ebook-forquem { position: relative; }
.ebook-forquem__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.ebook-forquem__item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255,255,255,0.08);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-accent);
}
.ebook-forquem__icon {
  flex-shrink: 0;
  color: var(--color-accent);
  margin-top: 2px;
}
.ebook-forquem__text {
  color: #fff;
  font-weight: 600;
  line-height: 1.4;
}

/* O que vai aprender */
.ebook-aprenda { position: relative; overflow: hidden; }
.ebook-aprenda__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.ebook-aprenda__card h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

/* Sobre a autora */
.ebook-autora { position: relative; overflow: hidden; }
.ebook-autora__inner {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  max-width: 700px;
  margin: 0 auto;
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 2.5rem;
  box-shadow: var(--shadow);
}
.ebook-autora__photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid var(--color-primary-light);
}
.ebook-autora__name {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.ebook-autora__bio { color: var(--color-text-light); line-height: 1.7; }

/* CTA Final */
.ebook-cta-final {
  padding: 5rem 0;
  background-color: var(--color-primary);
  text-align: center;
}
.ebook-cta-final h2 { color: #fff; margin-bottom: 1.5rem; }
.ebook-cta-final__price {
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
  display: block;
  margin-bottom: 0.5rem;
  line-height: 1;
}
.ebook-cta-final__note {
  color: rgba(255,255,255,0.82);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* Footer */
.ebook-footer {
  background-color: var(--color-primary-dark);
  padding: 1.5rem 0;
}
.ebook-footer__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.ebook-footer__copy { color: rgba(255,255,255,0.7); font-size: 0.875rem; }
.ebook-footer__social { display: flex; gap: 0.5rem; }
.ebook-footer__social a {
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: color var(--transition), background-color var(--transition);
}
.ebook-footer__social a:hover {
  color: #fff;
  background-color: rgba(255,255,255,0.1);
}

/* Responsivo */
@media (max-width: 767px) {
  .ebook-hero__grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .ebook-hero__img-wrap { order: -1; }
  .ebook-hero__img { transform: none; max-width: 280px; }
  .ebook-forquem__grid { grid-template-columns: 1fr; }
  .ebook-aprenda__grid { grid-template-columns: 1fr; }
  .ebook-autora__inner { flex-direction: column; text-align: center; }
  .cat-deco--ebook-hero,
  .cat-deco--ebook-aprenda,
  .cat-deco--ebook-autora { display: none; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .ebook-aprenda__grid { grid-template-columns: 1fr 1fr; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: adicionar estilos da landing page GATIFIQUE-se ao style.css"
```

---

### Task 3: Criar `gatifique-se.html`

**Files:**
- Create: `gatifique-se.html`

- [ ] **Step 1: Criar o arquivo completo**

Conteúdo completo de `gatifique-se.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GATIFIQUE-se | E-book — Guria dos Gatos</title>
  <meta name="description" content="O guia definitivo de como cuidar do seu gato. Aprenda comportamento felino, enriquecimento ambiental, higiene, saúde e muito mais.">

  <meta property="og:title" content="GATIFIQUE-se | Guia Definitivo de Como Cuidar do Seu Gato">
  <meta property="og:description" content="O e-book perfeito para quem quer entender, cuidar e se conectar com seu gatinho.">
  <meta property="og:image" content="images/ebook-capa.png">
  <meta property="og:type" content="product">
  <meta property="og:locale" content="pt_BR">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <header class="ebook-header">
    <a href="index.html" class="ebook-header__logo" aria-label="Voltar para Guria dos Gatos">
      <img src="logo-avatar.png" alt="Logo Guria dos Gatos" class="ebook-header__logo-img" width="44" height="44">
      <span class="ebook-header__logo-text">Guria dos Gatos</span>
    </a>
  </header>

  <main>

    <!-- Hero -->
    <section class="ebook-hero" aria-labelledby="ebook-hero-title">
      <div class="container">
        <div class="ebook-hero__grid">
          <div class="ebook-hero__content">
            <span class="badge ebook-hero__badge">E-book Digital</span>
            <h1 id="ebook-hero-title" class="ebook-hero__title">GATIFIQUE-se</h1>
            <p class="ebook-hero__subtitle">O guia definitivo de como cuidar do seu gato — do comportamento ao enriquecimento ambiental, com amor e ciência.</p>
            <div class="ebook-hero__price">
              <span class="ebook-hero__price-label">Apenas</span>
              <span class="ebook-hero__price-value">R$ 87,90</span>
            </div>
            <a href="https://pay.kiwify.com.br/PtIZo1R" class="btn btn--primary btn--lg" target="_blank" rel="noopener noreferrer">
              Quero meu e-book agora →
            </a>
          </div>
          <div class="ebook-hero__img-wrap">
            <img src="images/ebook-capa.png" alt="Capa do e-book GATIFIQUE-se — Guia Definitivo de Como Cuidar do Seu Gato" class="ebook-hero__img fade-up" loading="eager">
          </div>
        </div>
      </div>
      <img class="cat-deco cat-deco--ebook-hero" src="images/02_gato_bege_com_novelo.png" alt="" aria-hidden="true" loading="lazy">
    </section>

    <!-- Para quem é -->
    <section class="ebook-forquem section section--alt" aria-labelledby="forquem-title">
      <div class="container">
        <div class="section-header">
          <h2 id="forquem-title">Este e-book é para você que...</h2>
        </div>
        <div class="ebook-forquem__grid">

          <div class="ebook-forquem__item fade-up">
            <svg class="ebook-forquem__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="ebook-forquem__text">Precisa entender melhor o seu gatinho</span>
          </div>

          <div class="ebook-forquem__item fade-up">
            <svg class="ebook-forquem__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="ebook-forquem__text">Nunca teve gatos e quer se preparar para adotar um gatinho</span>
          </div>

          <div class="ebook-forquem__item fade-up">
            <svg class="ebook-forquem__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="ebook-forquem__text">Não sabe como brincar com seu gato</span>
          </div>

          <div class="ebook-forquem__item fade-up">
            <svg class="ebook-forquem__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="ebook-forquem__text">Quer entender o que são recursos e como distribuí-los na sua casa</span>
          </div>

          <div class="ebook-forquem__item fade-up">
            <svg class="ebook-forquem__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="ebook-forquem__text">Quer dicas valiosas de higiene, saúde e bem-estar</span>
          </div>

          <div class="ebook-forquem__item fade-up">
            <svg class="ebook-forquem__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="ebook-forquem__text">Precisa adaptar seus gatos e não sabe por onde começar</span>
          </div>

        </div>
      </div>
    </section>

    <!-- O que você vai aprender -->
    <section class="ebook-aprenda section" aria-labelledby="aprenda-title">
      <div class="container">
        <div class="section-header">
          <h2 id="aprenda-title">O que você vai aprender</h2>
          <p>Conteúdo prático e baseado em experiência real com dezenas de gatinhos.</p>
        </div>
        <div class="ebook-aprenda__grid">

          <div class="card ebook-aprenda__card fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-bottom:1rem"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <h3>Comportamento Felino</h3>
            <p>Entenda a linguagem corporal do seu gato, seus sinais de estresse, afeto e como ele se comunica com você.</p>
          </div>

          <div class="card ebook-aprenda__card fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-bottom:1rem"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <h3>Preparação para Adotar</h3>
            <p>Tudo o que você precisa ter e organizar em casa antes de trazer seu primeiro gatinho.</p>
          </div>

          <div class="card ebook-aprenda__card fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-bottom:1rem"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <h3>Brincadeiras e Estimulação</h3>
            <p>Como, quando e com quais brinquedos brincar para promover saúde física e mental do seu gato.</p>
          </div>

          <div class="card ebook-aprenda__card fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-bottom:1rem"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            <h3>Enriquecimento Ambiental</h3>
            <p>Recursos, arranhadores, tocas, playgrounds e como distribuí-los estrategicamente na sua casa.</p>
          </div>

          <div class="card ebook-aprenda__card fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-bottom:1rem"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <h3>Higiene e Saúde</h3>
            <p>Limpeza de olhos, corte de unhas, escovação e cuidados preventivos essenciais para o bem-estar felino.</p>
          </div>

          <div class="card ebook-aprenda__card fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-bottom:1rem"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>
            <h3>Adaptação Felina</h3>
            <p>Como introduzir um novo gato na casa respeitando o tempo e o espaço de cada um dos felinos.</p>
          </div>

        </div>
      </div>
      <img class="cat-deco cat-deco--ebook-aprenda" src="images/05_gato_marrom_alongando.png" alt="" aria-hidden="true" loading="lazy">
    </section>

    <!-- Sobre a autora -->
    <section class="ebook-autora section" aria-labelledby="autora-title">
      <div class="container">
        <div class="section-header">
          <h2 id="autora-title">Quem escreveu este e-book</h2>
        </div>
        <div class="ebook-autora__inner fade-up">
          <img src="logo-avatar.png" alt="Foto da Guria dos Gatos" class="ebook-autora__photo" width="100" height="100">
          <div>
            <p class="ebook-autora__name">Guria dos Gatos</p>
            <p class="ebook-autora__bio">Cat sitter domiciliar em Porto Alegre, com anos de experiência no comportamento e bem-estar felino. O <strong>GATIFIQUE-se</strong> nasceu da vontade de compartilhar tudo o que aprendi cuidando de dezenas de gatinhos — para que você e seu gato tenham a melhor vida juntos.</p>
          </div>
        </div>
      </div>
      <img class="cat-deco cat-deco--ebook-autora" src="images/04_gato_laranja_sentado.png" alt="" aria-hidden="true" loading="lazy">
    </section>

    <!-- CTA Final -->
    <section class="ebook-cta-final" aria-labelledby="cta-final-title">
      <div class="container">
        <h2 id="cta-final-title">Pronto para se GATIFICAR?</h2>
        <span class="ebook-cta-final__price">R$ 87,90</span>
        <p class="ebook-cta-final__note">Acesso imediato após a compra &bull; E-book em PDF</p>
        <a href="https://pay.kiwify.com.br/PtIZo1R" class="btn btn--white btn--lg" target="_blank" rel="noopener noreferrer">
          Garantir meu e-book agora →
        </a>
      </div>
    </section>

  </main>

  <footer class="ebook-footer">
    <div class="container">
      <div class="ebook-footer__inner">
        <span class="ebook-footer__copy">© 2026 Guria dos Gatos</span>
        <div class="ebook-footer__social">
          <a href="https://instagram.com/guriadosgatos" target="_blank" rel="noopener noreferrer" aria-label="Instagram da Guria dos Gatos">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://facebook.com/guriadosgatos" target="_blank" rel="noopener noreferrer" aria-label="Facebook da Guria dos Gatos">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>

  <script src="js/ebook.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verificar visualmente no browser**

Abrir `gatifique-se.html` no browser e conferir:
- Header mínimo com logo centralizado
- Hero duas colunas com capa e CTA
- Seção roxa "Para quem é" com 6 itens em 2 colunas
- 6 cards "O que vai aprender" em grid 3×2
- Card da autora com foto circular
- CTA final roxo com botão branco
- Footer escuro com ícones sociais
- Mobile: capa aparece em cima, seções em coluna única

- [ ] **Step 3: Commit final**

```bash
git add gatifique-se.html
git commit -m "feat: criar landing page GATIFIQUE-se com header, hero, para quem e, o que aprender, autora, CTA final e footer"
```

---

### Task 4: Push para produção

**Files:** nenhum

- [ ] **Step 1: Push**

```bash
git push
```

- [ ] **Step 2: Verificar**

Confirmar que os 3 commits estão no repositório remoto:
```bash
git log --oneline -5
```
