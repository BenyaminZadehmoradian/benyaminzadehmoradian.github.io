/* =============================================================
   script.js — Benyamin Zadehmoradian Resume  v4
   1.  Language Switch + Fade Transition + URL param   ← UPDATED
   2.  Theme Toggle + prefers-color-scheme              ← UPDATED
   3.  Header Hide + Scroll Progress Bar
   4.  Mobile Menu
   5.  Active Nav Highlight
   6.  Back to Top
   7.  Scroll Reveal
   8.  Copy Email + Toast Notification                  ← NEW
   9.  PWA / Service Worker Registration                ← NEW
  10.  Init
   ============================================================= */


/* ── 1. Language Switch ──────────────────────────────────── */
let _langSwitchTimer = null;

function _applyLang(lang) {
  const scrollY = window.scrollY;

  document.querySelectorAll('[data-lang]').forEach(el => {
    const show = el.getAttribute('data-lang') === lang;
    el.classList.toggle('hidden', !show);
    el.style.opacity   = '';
    el.style.transform = '';
    el.style.transition = '';
  });

  // Restore scroll to prevent jump from layout reflow
  window.scrollTo({ top: scrollY, behavior: 'instant' });

  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.classList.remove('bg-indigo-100','border-indigo-500','font-semibold',
                         'dark:bg-indigo-900','dark:border-indigo-400')
  );
  const activeBtn = document.getElementById('btn-' + lang);
  if (activeBtn) activeBtn.classList.add('bg-indigo-100','border-indigo-500',
                                         'font-semibold','dark:bg-indigo-900','dark:border-indigo-400');

  document.documentElement.lang = lang === 'nl' ? 'nl' : 'en';

  const announcer = document.getElementById('lang-announcer');
  if (announcer) {
    announcer.textContent = lang === 'nl'
      ? 'Taal gewijzigd naar Nederlands'
      : 'Language changed to English';
  }

  try { localStorage.setItem('preferred-lang', lang); } catch (e) {}
}

function switchLang(lang, updateURL = true) {
  const elements = document.querySelectorAll('[data-lang]');

  // Fade out visible elements
  elements.forEach(el => {
    if (!el.classList.contains('hidden')) {
      el.style.transition = 'opacity 0.15s ease';
      el.style.opacity    = '0';
    }
  });

  clearTimeout(_langSwitchTimer);
  _langSwitchTimer = setTimeout(() => {
    _applyLang(lang);

    // Fade in new elements
    document.querySelectorAll(`[data-lang="${lang}"]`).forEach(el => {
      if (!el.classList.contains('hidden')) {
        el.style.opacity = '0';
        void el.offsetWidth;
        el.style.transition = 'opacity 0.2s ease';
        el.style.opacity = '1';
      }
    });

    // Update URL without page reload
    if (updateURL && 'URLSearchParams' in window) {
      const url = new URL(window.location.href);
      if (lang === 'en') { url.searchParams.delete('lang'); }
      else               { url.searchParams.set('lang', lang); }
      const newURL = url.searchParams.toString()
        ? `${url.pathname}?${url.searchParams.toString()}`
        : url.pathname;
      history.replaceState({ lang }, '', newURL);
    }
  }, 150);
}


/* ── 2. Theme Toggle + prefers-color-scheme ─────────────── */
function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  updateThemeLabel();
}

function toggleTheme() {
  const isDark = !document.documentElement.classList.contains('dark');
  applyTheme(isDark);
  // Mark as manually set so OS changes don't override
  try { localStorage.setItem('prefers-dark', isDark ? '1' : '0'); } catch (e) {}
}

function updateThemeLabel() {
  const isDark = document.documentElement.classList.contains('dark');
  const label  = document.getElementById('theme-label');
  if (label) label.textContent = isDark ? 'Dark' : 'Light';
}

function initTheme() {
  try {
    const saved = localStorage.getItem('prefers-dark');
    if (saved === '1') { applyTheme(true);  return; }
    if (saved === '0') { applyTheme(false); return; }
  } catch (e) {}

  // No saved pref → respect OS setting
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // React to OS theme changes in real time (only when user hasn't overridden)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    try { if (localStorage.getItem('prefers-dark') !== null) return; } catch (_) {}
    applyTheme(e.matches);
  });
}


/* ── 3. Header Hide + Scroll Progress ───────────────────── */
let lastScrollTop = 0;

function handleScroll() {
  const currentScroll = window.scrollY;

  const header = document.getElementById('site-header');
  if (header) {
    header.classList.toggle(
      'header-hidden',
      currentScroll > lastScrollTop && currentScroll > 80
    );
  }
  lastScrollTop = Math.max(0, currentScroll);

}


/* ── 4. Mobile Menu ──────────────────────────────────────── */
function setupMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () =>
    menu.classList.contains('mobile-menu-open') ? closeMobileMenu() : openMobileMenu()
  );
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) closeMobileMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function openMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  menu.classList.replace('mobile-menu-closed', 'mobile-menu-open');
  menu.setAttribute('aria-hidden', 'false');
  if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.classList.add('is-open'); }
}

function closeMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  menu.classList.replace('mobile-menu-open', 'mobile-menu-closed');
  menu.setAttribute('aria-hidden', 'true');
  if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('is-open'); }
}


/* ── 5. Active Nav Highlight ─────────────────────────────── */
function setupActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link =>
          link.classList.toggle('active', link.dataset.section === entry.target.id)
        );
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => obs.observe(s));
}


/* ── 6. Back to Top ──────────────────────────────────────── */
function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () =>
    btn.classList.toggle('show', window.scrollY > 300), { passive: true }
  );
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}


/* ── 7. Scroll Reveal ────────────────────────────────────── */
function setupScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}


/* ── 8. Copy Email + Toast Notification ─────────────────── */
let _toastTimer = null;

function showToast(message, type = 'success') {
  let toast = document.getElementById('copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.className = `copy-toast copy-toast-${type} copy-toast-show`;
  toast.textContent = message;

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('copy-toast-show'), 2800);
}

function copyEmail(emailAddress) {
  const isNL      = document.documentElement.lang === 'nl';
  const successMsg = isNL ? '✓ E-mailadres gekopieerd!' : '✓ Email address copied!';
  const failMsg    = isNL ? 'Kopiëren mislukt'           : 'Could not copy — try manually';

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(emailAddress)
      .then(()  => showToast(successMsg))
      .catch(() => showToast(failMsg, 'error'));
  } else {
    // Fallback for non-HTTPS / older browsers
    const ta = Object.assign(document.createElement('textarea'), {
      value: emailAddress,
      style: 'position:fixed;top:-9999px;left:-9999px;opacity:0'
    });
    document.body.appendChild(ta);
    ta.select();
    try   { document.execCommand('copy'); showToast(successMsg); }
    catch { showToast(failMsg, 'error'); }
    document.body.removeChild(ta);
  }
}

function setupCopyEmail() {
  document.querySelectorAll('[data-copy-email]').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Click to copy';
    el.addEventListener('click', e => {
      e.preventDefault();
      copyEmail(el.dataset.copyEmail);
    });
  });
}


/* ── 9. PWA / Service Worker ─────────────────────────────── */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Failed:', err));
  });
}


/* ── 10. Init ────────────────────────────────────────────── */

// Take over scroll restoration so layout shifts don't cause jumps
history.scrollRestoration = 'manual';

// Save scroll position before the page unloads
window.addEventListener('pagehide', () => {
  try { sessionStorage.setItem('cv-scrollY', String(Math.round(window.scrollY))); } catch (e) {}
});

document.addEventListener('DOMContentLoaded', () => {

  // Theme: OS preference → then localStorage override
  initTheme();

  // Language: URL param → localStorage → default 'en'
  let lang = 'en';
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang === 'nl' || urlLang === 'en') {
      lang = urlLang;
    } else {
      lang = localStorage.getItem('preferred-lang') || 'en';
    }
  } catch (e) {}
  _applyLang(lang); // instant swap on load — no animation

  // Restore scroll position after all DOM changes are done
  try {
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    if (navType === 'reload' || navType === 'back_forward') {
      const savedY = parseInt(sessionStorage.getItem('cv-scrollY') || '0', 10);
      if (savedY > 0) window.scrollTo({ top: savedY, behavior: 'instant' });
    }
  } catch (e) {}

  // All features
  setupMobileMenu();
  setupBackToTop();
  setupScrollReveal();
  setupActiveNav();
  setupCopyEmail();
  registerServiceWorker();

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Handle browser back/forward navigation with ?lang=
  window.addEventListener('popstate', e => {
    if (e.state?.lang) switchLang(e.state.lang, false);
  });
});
