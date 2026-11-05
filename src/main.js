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
      case 'whatsapp-href': {
        // value is the WhatsApp number; build a wa.me link with optional text.
        const msg = SITE.contact && SITE.contact.whatsappMessage;
        const url = 'https://wa.me/' + value + (msg ? '?text=' + encodeURIComponent(msg) : '');
        el.setAttribute('href', url);
        break;
      }
      default:
        el.setAttribute(attr, value);
    }
  });

  // Hide WhatsApp buttons if no number is configured.
  if (!(SITE.contact && SITE.contact.whatsapp)) {
    document.querySelectorAll('[data-whatsapp]').forEach((el) => {
      el.classList.add('hidden');
    });
  }

  // Populate the suburb <datalist> on the callback form (suggestions only;
  // the field still accepts any suburb the visitor types).
  const suburbOptions = document.getElementById('suburb-options');
  if (suburbOptions) {
    suburbOptions.textContent = '';
    // Every suburb across all regions, listed once (e.g. Canterbury appears
    // in two regions but is only suggested once).
    const names = new Set();
    (SITE.regions || []).forEach((region) => {
      (region.suburbs || []).forEach((name) => names.add(name));
    });
    names.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      suburbOptions.appendChild(opt);
    });
  }
}

/* ---- Coverage area: regions -> suburbs + service type -------------
 * Renders the three regions from SITE.regions as tabs. Hovering (or
 * focusing / tapping) a region slowly fades in that region's suburbs and
 * the service types it covers, each with a tick. Panels are stacked in
 * one grid cell, so the card never changes height when you switch.
 * The static list in the HTML is a no-JS fallback that this replaces.
 * ----------------------------------------------------------------- */
const SERVICE_KEYS = {
  both: ['clinical', 'personal'],
  clinical: ['clinical'],
  personal: ['personal'],
  specialist: ['specialist'],
};
const SERVICE_BADGE = {
  both: 'Both clinical & personal care',
  clinical: 'Clinical care only',
  personal: 'Personal care only',
  specialist: 'Specialist care',
};
const REGION_TONES = ['teal', 'blue', 'amber'];

// Static, trusted SVG markup (no user data is interpolated into these).
const PIN_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></svg>';
const TICK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="tick-path" d="M7 12.5l3.2 3.2L17 8.8" /></svg>';

function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function makeTick() {
  const tick = makeEl('span', 'tick');
  tick.innerHTML = TICK_SVG;
  return tick;
}

function initRegions() {
  const host = document.querySelector('[data-regions]');
  const regions = (SITE.regions || []).filter((r) => r && r.name);
  if (!host || !regions.length) return;

  const types = SITE.serviceTypes || {};
  const tabs = makeEl('div', 'region-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Coverage regions');
  const panels = makeEl('div', 'region-panels');

  regions.forEach((region, i) => {
    const tone = REGION_TONES[i % REGION_TONES.length];
    const suburbs = region.suburbs || [];
    const kind = SERVICE_KEYS[region.serviceType] ? region.serviceType : 'both';

    // --- Tab ---
    const tab = makeEl('button', 'region-tab');
    tab.type = 'button';
    tab.id = 'region-tab-' + i;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'region-panel-' + i);
    tab.setAttribute('data-tone', tone);
    const icon = makeEl('span', 'region-tab-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = PIN_SVG;
    const label = makeEl('span', 'text-left');
    label.appendChild(makeEl('span', 'block font-display text-[0.95rem] font-semibold leading-tight', region.name));
    tab.appendChild(icon);
    tab.appendChild(label);
    tabs.appendChild(tab);

    // --- Panel ---
    const panel = makeEl('div', 'region-panel');
    panel.id = 'region-panel-' + i;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.setAttribute('data-tone', tone);

    const head = makeEl('div', 'flex flex-wrap items-center justify-between gap-2');
    head.appendChild(makeEl('h4', '', region.name));
    const badge = makeEl('span', 'region-badge');
    badge.appendChild(makeTick());
    badge.appendChild(document.createTextNode(SERVICE_BADGE[kind]));
    head.appendChild(badge);
    panel.appendChild(head);

    panel.appendChild(makeEl('p', 'region-label mt-3', 'Suburbs we cover'));
    const chipList = makeEl('ul', 'mt-2 flex flex-wrap gap-2');
    suburbs.forEach((name, n) => {
      const li = makeEl('li', 'region-chip', name);
      li.style.setProperty('--i', String(n));
      chipList.appendChild(li);
    });
    panel.appendChild(chipList);

    panel.appendChild(makeEl('p', 'region-label mt-5', 'Service type'));
    const serviceList = makeEl('ul', 'mt-2 grid gap-2.5 sm:grid-cols-2');
    SERVICE_KEYS[kind].forEach((key, n) => {
      const def = types[key] || { label: key, detail: '' };
      const li = makeEl('li', 'region-service');
      li.style.setProperty('--i', String(suburbs.length + n));
      li.appendChild(makeTick());
      const text = makeEl('span', 'block');
      text.appendChild(makeEl('span', 'block font-semibold text-ink-900 dark:text-cloud-50', def.label));
      if (def.detail) text.appendChild(makeEl('span', 'block text-sm', def.detail));
      li.appendChild(text);
      serviceList.appendChild(li);
    });
    panel.appendChild(serviceList);

    panels.appendChild(panel);
  });

  host.textContent = '';
  host.appendChild(tabs);
  host.appendChild(panels);

  const tabEls = Array.from(tabs.children);
  const panelEls = Array.from(panels.children);

  const select = (index, focus) => {
    tabEls.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panelEls[i].setAttribute('data-active', String(active));
      panelEls[i].setAttribute('aria-hidden', String(!active));
    });
    if (focus) tabEls[index].focus();
  };

  tabEls.forEach((tab, i) => {
    tab.addEventListener('mouseenter', () => select(i, false));
    tab.addEventListener('focus', () => select(i, false));
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabEls.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabEls.length) % tabEls.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabEls.length - 1;
      if (next !== null) {
        e.preventDefault();
        select(next, true);
      }
    });
  });

  select(0, false);
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

/* ---- Refer a patient: drifting cards ------------------------------
 * Turns the cards into a slow right-to-left drift behind the front block,
 * but only when that is comfortable and safe:
 *   - screen is large (>= 1024px) and the browser supports container units
 *   - the visitor has not asked for reduced motion
 *   - a keyboard user is not tabbing through the card links (a link that is
 *     moving or hidden behind the block would be unusable, so we drop back
 *     to the calm static layout while focus is inside the cards)
 * Hover pauses the motion (CSS).
 * ----------------------------------------------------------------- */
function initReferStage() {
  const stage = document.querySelector('[data-refer-stage]');
  if (!stage) return;
  const cards = stage.querySelector('.refer-cards');

  const wide = window.matchMedia('(min-width: 1024px)');
  const calm = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const supported = !!(window.CSS && CSS.supports && CSS.supports('width', '1cqw'));
  let keyboardInside = false;

  const apply = () => {
    stage.classList.toggle('is-marquee', supported && wide.matches && calm.matches && !keyboardInside);
  };
  [wide, calm].forEach((m) => m.addEventListener('change', apply));

  stage.addEventListener('focusin', (e) => {
    if (!cards || !cards.contains(e.target)) return;
    let viaKeyboard = true;
    try {
      viaKeyboard = e.target.matches(':focus-visible');
    } catch (err) {
      /* very old browser: treat as keyboard to be safe */
    }
    if (!viaKeyboard) return;
    keyboardInside = true;
    apply();
    e.target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
  stage.addEventListener('focusout', (e) => {
    if (cards && cards.contains(e.relatedTarget)) return;
    keyboardInside = false;
    apply();
  });

  apply();
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
  initRegions();
  initReveal();
  initCallbackForm();
  initSteps();
  initReferStage();
  initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { SITE };
