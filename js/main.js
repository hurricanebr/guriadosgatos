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
