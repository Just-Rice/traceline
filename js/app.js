// Router and boot. Hash routing keeps the whole thing deployable as static
// files with no server rewrite rules.

import { buildPopulation } from './generator.js';
import { buildIndex, search, statesInUse } from './search.js';
import { header, footer } from './ui.js';
import { homeView, resultsView, scannerView, pricingView, aboutView, PAGE_SIZE } from './views.js';
import { renderReport } from './report.js';

const HOUSEHOLDS = 850;
const SEED = 20260902;

const t0 = performance.now();
const { people, byId } = buildPopulation(SEED, HOUSEHOLDS);
const buildMs = Math.round(performance.now() - t0);
const index = buildIndex(people);
const STATES = statesInUse(people);

const stats = {
  people: people.length,
  households: HOUSEHOLDS,
  cities: new Set(people.map(p => `${p.city}|${p.state}`)).size,
  states: STATES.length,
  relations: people.reduce((n, p) => n + p.relatives.length, 0),
  assocs: people.reduce((n, p) => n + p.associates.length, 0),
  ms: buildMs
};

const app = document.getElementById('app');
const chrome = document.getElementById('chrome');
const foot = document.getElementById('foot');

/* ---------- theme ---------- */

const THEME_KEY = 'traceline.theme';
function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch { /* storage unavailable — fall back to the media query */ }
}
function toggleTheme() {
  const el = document.documentElement;
  const now = el.dataset.theme
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = now === 'dark' ? 'light' : 'dark';
  el.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
}
initTheme();

/* ---------- route parsing ---------- */

function parseRoute() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, qs, params: new URLSearchParams(qs) };
}

const scanned = new Set();   // query strings already animated this session
let renders = 0;             // lets a finished scan tell whether its page is still the one showing

function setChrome(active) {
  chrome.innerHTML = header(active);
  foot.innerHTML = footer();
  const tt = document.getElementById('themeToggle');
  if (tt) tt.addEventListener('click', toggleTheme);
}

function render() {
  const turn = ++renders;
  const { path, qs, params } = parseRoute();
  const seg = path.split('/').filter(Boolean);

  if (seg[0] === 'results') {
    setChrome('home');
    const raw = {
      first: params.get('first') || '',
      last: params.get('last') || '',
      state: params.get('state') || '',
      city: params.get('city') || '',
      free: params.get('q') || ''
    };
    const page = Math.floor(Number(params.get('page'))) || 1;   // a page that is not a number is page 1
    const { results, query } = search(index, raw);
    const key = qs.replace(/[?&]page=\d+/, '');

    const show = () => {
      // The scan takes over a second. Someone who has gone to another page
      // by then must not have the results drawn over it.
      if (turn !== renders) return;
      app.innerHTML = resultsView(results, query, page, qs);
      window.scrollTo(0, 0);
    };

    if (scanned.has(key) || page > 1) { show(); return; }
    scanned.add(key);
    const label = [raw.first, raw.last].filter(Boolean).join(' ') || raw.free || 'your search';
    app.innerHTML = scannerView(label);
    runScanner(show);
    return;
  }

  if (seg[0] === 'report' && seg[1]) {
    const p = byId.get(seg[1]);
    setChrome(null);
    if (!p) {
      app.innerHTML = `<div class="wrap"><div class="empty">
        <h2>No such record</h2>
        <p>That report ID isn't in this dataset.</p>
        <p style="margin-top:18px"><a class="btn btn-ghost" href="#/">Back to search</a></p>
      </div></div>`;
      return;
    }
    app.innerHTML = renderReport(p, byId, params.get('tab') || 'overview');
    markTabOverflow();
    window.scrollTo(0, 0);
    return;
  }

  if (seg[0] === 'pricing') {
    setChrome('pricing');
    app.innerHTML = pricingView();
    window.scrollTo(0, 0);
    return;
  }

  if (seg[0] === 'about') {
    setChrome('about');
    app.innerHTML = aboutView(stats);
    window.scrollTo(0, 0);
    return;
  }

  setChrome('home');
  app.innerHTML = homeView(STATES);
  wireSearchForm();
  window.scrollTo(0, 0);
}

// Flag an overflowing tab row so the fade affordance shows.
function markTabOverflow() {
  const wrap = document.querySelector('.tabs-wrap');
  const tabs = wrap && wrap.querySelector('.tabs');
  if (!wrap || !tabs) return;
  const over = tabs.scrollWidth > tabs.clientWidth + 1;
  wrap.classList.toggle('is-overflowing', over);
  // Keep the active tab in view when the row scrolls.
  const active = tabs.querySelector('[aria-selected="true"]');
  if (over && active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

window.addEventListener('resize', markTabOverflow);

/* ---------- scanner animation ---------- */

function runScanner(done) {
  const fill = document.getElementById('scanFill');
  const steps = [...document.querySelectorAll('.scan-step')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { done(); return; }

  let i = 0;
  const tick = () => {
    if (i >= steps.length) { setTimeout(done, 180); return; }
    steps[i].classList.add('done');
    i++;
    if (fill) fill.style.width = `${(i / steps.length) * 100}%`;
    setTimeout(tick, 150 + Math.random() * 120);
  };
  setTimeout(tick, 120);
}

/* ---------- interactions ---------- */

function wireSearchForm() {
  const form = document.getElementById('searchForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const u = new URLSearchParams();
    for (const k of ['first', 'last', 'state']) {
      const v = (fd.get(k) || '').toString().trim();
      if (v) u.set(k, v);
    }
    if (![...u.keys()].length) {
      form.querySelector('#q-last').focus();
      return;
    }
    location.hash = `#/results?${u.toString()}`;
  });
}

// Delegated tab switching — the report re-renders through the router so the
// active tab stays in the URL and survives a reload.
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    const { path } = parseRoute();
    const id = path.split('/').filter(Boolean)[1];
    if (id) location.hash = `#/report/${id}?tab=${tab.dataset.tab}`;
    return;
  }

});

window.addEventListener('hashchange', render);
render();

// Handy when poking at the dataset from the console.
window.traceline = { people, byId, index, stats, search: q => search(index, q) };
