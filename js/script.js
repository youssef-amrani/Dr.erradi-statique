(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const body          = document.body;
  const navbar        = $('#navbar');
  const navLinks      = $('#nav-links');
  const navHamburger  = $('#nav-hamburger');
  const mobileOverlay = $('#mobile-overlay');
  const themeToggle   = $('#theme-toggle');
  const scrollTopBtn  = $('#scroll-top');
  const whatsappFloat = $('#whatsapp-float');
  const faqItems      = $$('.faq-item');
  const contactForm   = $('#contact-form');
  const navAnchors    = $$('.nav-link[href^="#"]');

  /* ============================================
     1. Theme System
     ============================================ */

  const THEME_KEY = 'dr-erradi-theme';

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'
      );
    }
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ============================================
     2. Working Hours — Badge Status
     ============================================ */

  function updateOfficeStatus() {
    const badge = $('#hero-badge-text');
    const dot = $('.hero-badge-dot');
    if (!badge || !dot) return;

    const now = new Date();
    const day = now.getDay();       // 0=Sun, 1=Mon, ..., 6=Sat
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour * 60 + minute;

    const weekdays = [
      { open: 9 * 60, close: 18 * 60 },   // Mon
      { open: 9 * 60, close: 18 * 60 },   // Tue
      { open: 9 * 60, close: 18 * 60 },   // Wed
      { open: 9 * 60, close: 18 * 60 },   // Thu
      { open: 9 * 60, close: 18 * 60 },   // Fri
      { open: 9 * 60, close: 13 * 60 },   // Sat
      null                                  // Sun (closed)
    ];

    const schedule = weekdays[day];

    if (schedule && time >= schedule.open && time < schedule.close) {
      badge.textContent = 'Cabinet ouvert — Prenez rendez-vous';
      dot.style.background = '';
    } else {
      badge.textContent = 'Cabinet fermé';
      dot.style.background = 'var(--clr-text-muted)';
    }
  }

  updateOfficeStatus();

  /* ============================================
     3. Navigation — Scroll Effects
     ============================================ */

  let lastScroll = 0;
  const SCROLL_THRESHOLD = 50;

  function handleNavScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }

  /* ============================================
     3. Mobile Navigation
     ============================================ */

  function openMobileNav() {
    navLinks.classList.add('open');
    navHamburger.classList.add('open');
    mobileOverlay.classList.add('active');
    body.style.overflow = 'hidden';
    navHamburger.setAttribute('aria-expanded', 'true');
    navHamburger.focus();
  }

  function closeMobileNav() {
    navLinks.classList.remove('open');
    navHamburger.classList.remove('open');
    mobileOverlay.classList.remove('active');
    body.style.overflow = '';
    navHamburger.setAttribute('aria-expanded', 'false');
  }

  if (navHamburger) {
    navHamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileNav);
  }

  navAnchors.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileNav();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileNav();
    }
  });

  /* ============================================
     4. Active Navigation Link Tracking
     ============================================ */

  const sections = $$('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ============================================
     5. Scroll-to-Top Button
     ============================================ */

  function handleScrollTop() {
    const show = window.scrollY > 400;
    scrollTopBtn.classList.toggle('visible', show);
    if (whatsappFloat) whatsappFloat.classList.toggle('visible', show);
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     6. FAQ Accordion
     ============================================ */

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const content = item.querySelector('.faq-answer-content');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          otherAnswer.style.maxHeight = '0px';
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0px';
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = content.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ============================================
     7. Scroll Reveal Animations
     ============================================ */

  const revealElements = $$('.reveal, .reveal-left, .reveal-right, .stagger-children');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ============================================
     8. Contact Form — Envoi vers WhatsApp
     ============================================ */

  const WHATSAPP_NUMBER = '212600000000';

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = $('#form-name', contactForm).value.trim();
      const email   = $('#form-email', contactForm).value.trim();
      const phone   = $('#form-phone', contactForm).value.trim();
      const subject = $('#form-subject', contactForm).value.trim();
      const message = $('#form-message', contactForm).value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !emailRegex.test(email) || !message) return;

      const text = `Nouveau message du formulaire
Nom: ${name}
Email: ${email}
Telephone: ${phone || 'Non renseigne'}
Sujet: ${subject || 'Non renseigne'}

Message:
${message}`;

      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
      window.location.href = url;
      contactForm.reset();
    });
  }

  /* ============================================
     9. Smooth Scroll for Anchor Links
     ============================================ */

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = $(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ============================================
     10. Counter Animation (Hero stats)
     ============================================ */

  const counters = $$('[data-count]');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current) + suffix;
      }, 16);
    });

    countersAnimated = true;
  }

  const heroStats = $('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });

    statsObserver.observe(heroStats);
  }

  /* ============================================
     11. Consolidated Scroll Listener
     ============================================ */

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleNavScroll();
        handleScrollTop();
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  handleNavScroll();
  handleScrollTop();
  updateActiveNav();

  /* ============================================
     12. Preloader / Page Load
     ============================================ */

  window.addEventListener('load', () => {
    setTimeout(() => {
      body.classList.add('loaded');
    }, 100);
  });

})();
