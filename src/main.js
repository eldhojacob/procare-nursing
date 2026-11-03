/* =====================================================================
 * PROCARE NURSING — main.js
 * Progressive enhancement: theme toggle, config hydration, scroll-reveal,
 * and the callback form. The site is fully readable without JS.
 * (Config hydration + scroll-reveal are added in task 4; the form in
 * task 13.)
 * ===================================================================== */

import { SITE } from './config.js';

/* ---- Theme toggle (light / dark) --------------------------------- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const sync = () => {
    const isDark = document.documentElement.classList.contains('dark');
    toggle.setAttribute('aria-pressed', String(isDark));
  };
  sync();

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('procare-theme', isDark ? 'dark' : 'light');
    } catch (e) {
      /* storage may be unavailable; theme still toggles for this session */
    }
    sync();
  });

  // Follow OS changes only when the user hasn't made an explicit choice.
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem('procare-theme');
    } catch (err) {
      /* ignore */
    }
    if (!saved) {
      document.documentElement.classList.toggle('dark', e.matches);
      sync();
    }
  });
}

/* ---- Config hydration -------------------------------------------
 * Reads a dotted path (e.g. "contact.phone") out of SITE and writes it
 * into the element. How it is written depends on data-config-attr:
 *   (none)      -> element text content
 *   "tel-href"  -> href = "tel:" + value
 *   "mailto-href" -> href = "mailto:" + value  (text set too if empty)
 *   "href"      -> href = value
 *   <anything>  -> that attribute = value
 * Static fallback text already lives in the HTML, so there is never an
 * empty flash and the page still reads correctly if JS fails.
 * ----------------------------------------------------------------- */
function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function hydrateConfig() {
  document.querySelectorAll('[data-config]').forEach((el) => {
    const value = getPath(SITE, el.getAttribute('data-config'));
    if (value == null) return;
    const attr = el.getAttribute('data-config-attr');

    switch (attr) {
      case null:
        el.textContent = value;
        break;
      case 'tel-href':
        el.setAttribute('href', 'tel:' + value);
        break;
      case 'mailto-href':
        el.setAttribute('href', 'mailto:' + value);
        if (!el.textContent.trim()) el.textContent = value;
        break;
      case 'href':
        el.setAttribute('href', value);
        break;
      default:
        el.setAttribute(attr, value);
    }
  });

  // Render the editable suburb list as chips. Hovering (or focusing) a
  // chip swaps the banner image above to that suburb's photo, with a slow
  // fade. Images cycle through a small set of real Sydney streetscapes.
  const suburbImages = [
    './assets/img/photos/suburbs/suburb-1.jpg',
    './assets/img/photos/suburbs/suburb-2.jpg',
    './assets/img/photos/suburbs/suburb-3.jpg',
  ];
  const banner = document.getElementById('suburb-banner');
  const bannerTitle = document.getElementById('suburb-banner-title');
  const defaultBannerSrc = banner ? banner.getAttribute('src') : null;
  const defaultBannerTitle = bannerTitle ? bannerTitle.textContent : '';

  // Preload the suburb images so the banner swap is instant (no flash of
  // empty space during the fade).
  suburbImages.forEach((src) => {
    const pre = new Image();
    pre.src = src;
  });

  const swapBanner = (src, title) => {
    if (!banner) return;
    // Fade out, change source, fade back in.
    banner.style.opacity = '0';
    window.setTimeout(() => {
      banner.setAttribute('src', src);
      banner.style.opacity = '1';
    }, 180);
    if (bannerTitle && title != null) bannerTitle.textContent = title;
  };

  document.querySelectorAll('[data-config-suburbs]').forEach((container) => {
    container.textContent = '';
    SITE.suburbs.forEach((suburb, i) => {
      const li = document.createElement('li');
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip chip-interactive';
      chip.textContent = suburb;

      const img = suburbImages[i % suburbImages.length];
      const show = () => swapBanner(img, suburb);
      const reset = () => swapBanner(defaultBannerSrc, defaultBannerTitle);

      chip.addEventListener('mouseenter', show);
      chip.addEventListener('focus', show);
      chip.addEventListener('mouseleave', reset);
      chip.addEventListener('blur', reset);

      li.appendChild(chip);
      container.appendChild(li);
    });
  });

  // Populate the suburb <datalist> on the callback form (suggestions only;
  // the field still accepts any suburb the visitor types).
  const suburbOptions = document.getElementById('suburb-options');
  if (suburbOptions) {
    suburbOptions.textContent = '';
    SITE.suburbs.forEach((suburb) => {
      const opt = document.createElement('option');
      opt.value = suburb;
      suburbOptions.appendChild(opt);
    });
  }
}

/* ---- Scroll-reveal ----------------------------------------------
 * Adds .is-visible to .reveal elements as they enter the viewport.
 * Respects prefers-reduced-motion by showing everything immediately
 * (the CSS @media block also guards this).
 * ----------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!items.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Honour an optional stagger delay set per element.
          const delay = entry.target.getAttribute('data-reveal-delay');
          if (delay) entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---- Callback form ----------------------------------------------
 * Validation + submission for the callback request form.
 *   • Honeypot: if filled, silently "succeed" and send nothing (R8.3).
 *   • Required-field validation with inline aria errors + focus (R8.4).
 *   • Submits to Formspree (default) or Netlify Forms per config (R8.5).
 *   • Success (role=status) and error (role=alert + phone) states.
 * Native `required` attributes are the no-JS fallback.
 * ----------------------------------------------------------------- */
function initCallbackForm() {
  const form = document.getElementById('callback-form');
  if (!form) return;

  const submitBtn = document.getElementById('cb-submit');
  const successPanel = document.getElementById('form-success');
  const errorPanel = document.getElementById('form-error');
  const submitLabel = submitBtn ? submitBtn.textContent : 'Submit';

  // Required fields -> their error container id and a friendly message.
  const rules = [
    { name: 'name', errorId: 'cb-name-error', message: 'Please enter your name.' },
    { name: 'phone', errorId: 'cb-phone-error', message: 'Please enter a phone number we can call you on.' },
    { name: 'suburb', errorId: 'cb-suburb-error', message: 'Please enter your suburb.' },
    { name: 'who_for', errorId: 'cb-whofor-error', message: 'Please tell us who this is for.' },
    { name: 'safe_time', errorId: 'cb-time-error', message: 'Please choose a safe time to call.' },
  ];

  const showError = (errorId, message, field) => {
    const el = document.getElementById(errorId);
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden');
    }
    if (field) field.setAttribute('aria-invalid', 'true');
  };

  const clearError = (errorId, field) => {
    const el = document.getElementById(errorId);
    if (el) {
      el.textContent = '';
      el.classList.add('hidden');
    }
    if (field) field.removeAttribute('aria-invalid');
  };

  const fieldValue = (name) => {
    const el = form.elements[name];
    if (!el) return '';
    // RadioNodeList (radio group) exposes .value of the checked one.
    return (el.value || '').trim();
  };

  const validate = () => {
    let firstInvalid = null;
    rules.forEach((rule) => {
      const value = fieldValue(rule.name);
      const field = form.elements[rule.name];
      const focusable = field && field.length ? field[0] : field;
      if (!value) {
        showError(rule.errorId, rule.message, focusable);
        if (!firstInvalid) firstInvalid = focusable;
      } else {
        clearError(rule.errorId, focusable);
      }
    });
    return firstInvalid;
  };

  const setSubmitting = (on) => {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Sending…' : submitLabel;
    submitBtn.classList.toggle('opacity-70', on);
  };

  const hide = (el) => el && el.classList.add('hidden');
  const reveal = (el) => el && el.classList.remove('hidden');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hide(errorPanel);

    // 1) Honeypot: a filled "company" means a bot. Silently succeed. (R8.3)
    if (fieldValue('company')) {
      form.reset();
      hide(form);
      reveal(successPanel);
      return;
    }

    // 2) Validate required fields. (R8.4)
    const firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // 3) Submit to the configured backend. (R8.5)
    setSubmitting(true);
    try {
      const provider = (SITE.form && SITE.form.provider) || 'formspree';
      const data = new FormData(form);
      let response;

      if (provider === 'netlify') {
        // Netlify Forms: POST urlencoded back to the page path.
        response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
      } else {
        // Formspree (default): JSON POST to the form endpoint.
        const id = SITE.form && SITE.form.formspreeId;
        if (!id) throw new Error('Formspree ID is not configured.');
        response = await fetch('https://formspree.io/f/' + id, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
      }

      if (!response || !response.ok) throw new Error('Bad response');

      // 4) Success. (R8.6)
      form.reset();
      hide(form);
      reveal(successPanel);
      successPanel.focus && successPanel.focus();
    } catch (err) {
      // 5) Error + phone fallback. (R8.7)
      reveal(errorPanel);
      setSubmitting(false);
    }
  });

  // Clear a field's error as the visitor fixes it.
  rules.forEach((rule) => {
    const field = form.elements[rule.name];
    if (!field) return;
    const nodes = field.length ? Array.from(field) : [field];
    nodes.forEach((node) => {
      const evt = node.type === 'radio' || node.tagName === 'SELECT' ? 'change' : 'input';
      node.addEventListener(evt, () => {
        if (fieldValue(rule.name)) clearError(rule.errorId, nodes[0]);
      });
    });
  });
}

/* ---- "How it works" interactive stepper -------------------------
 * Tabs (role="tab") control detail panels (role="tabpanel"). The active
 * tab is highlighted via aria-selected; others are faded. Keyboard:
 * arrow keys move between tabs, Enter/Space/click activate.
 * ----------------------------------------------------------------- */
function initSteps() {
  const tablist = document.getElementById('how-steps');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('hidden', !active);
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    // Reveal on hover (pointer devices); click/keyboard still work for
    // touch and accessibility.
    tab.addEventListener('mouseenter', () => select(i, false));
    tab.addEventListener('focus', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        select(next, true);
      }
    });
  });

  // Start with the first step selected and the rest faded.
  select(0, false);
}

/* ---- Footer year ------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* ---- Bootstrap --------------------------------------------------- */
function init() {
  initTheme();
  hydrateConfig();
  initReveal();
  initCallbackForm();
  initSteps();
  initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { SITE };
