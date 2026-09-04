// Shared rendering helpers: escaping, chrome, small formatters.

import { SOURCE_BY_ID } from './pools.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const initials = p =>
  (p.first[0] + (p.last[0] || '')).toUpperCase();

export const yearsSpan = (from, to) =>
  to ? `${from} – ${to}` : `${from} – Present`;

// Inline provenance marker shown next to a value in the body of the report.
export function srcTag(srcId, observed) {
  const m = SOURCE_BY_ID[srcId];
  if (!m) return '';
  return `<span class="src-tag" title="${esc(m.kind)} feed · refreshed ${esc(m.cadence)} · ${esc(m.reliability)} reliability">`
    + `via ${esc(m.name)}${observed ? ` · ${observed}` : ''}</span>`;
}

export function confidencePill(n) {
  const cls = n >= 85 ? 'ok' : n >= 72 ? '' : 'mid';
  const label = n >= 85 ? 'High confidence' : n >= 72 ? 'Medium confidence' : 'Low confidence';
  return `<span class="pill ${cls}">${label} · ${n}%</span>`;
}

export const ICONS = {
  logo: `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <rect width="26" height="26" rx="7" fill="currentColor" opacity=".12"/>
    <circle cx="11.5" cy="11.5" r="5.2" stroke="currentColor" stroke-width="2"/>
    <path d="M15.4 15.4L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lock: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/>
    <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round"/></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.7"/>
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  layers: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5L18 7l-8 4.5L2 7l8-4.5z" stroke="currentColor" stroke-width="1.7"
      stroke-linejoin="round"/>
    <path d="M2.5 11.5L10 15.8l7.5-4.3" stroke="currentColor" stroke-width="1.7"
      stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  link: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M8.5 11.5a3.2 3.2 0 004.6 0l2.4-2.4a3.2 3.2 0 10-4.6-4.6l-1 1"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M11.5 8.5a3.2 3.2 0 00-4.6 0l-2.4 2.4a3.2 3.2 0 104.6 4.6l1-1"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5l6 2.2v4.6c0 3.6-2.4 6.8-6 8.2-3.6-1.4-6-4.6-6-8.2V4.7l6-2.2z"
      stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`
};

export function header(active) {
  return `
  <div class="topbar">
  <div class="demo-banner">
    <strong>Nothing here is real.</strong> Traceline is a demonstration.
    Every name, face, address, relative and record is invented by a random
    number generator in your browser — these people do not exist.
    <a href="#/about">How this works</a>
  </div>
  <header class="site-header">
    <div class="wrap">
      <a class="logo" href="#/"><span style="color:var(--brand)">${ICONS.logo}</span>Traceline</a>
      <nav class="nav">
        <a href="#/" class="${active === 'home' ? 'active' : ''}">Search</a>
        <a href="#/pricing" class="${active === 'pricing' ? 'active' : ''}">Plans</a>
        <a href="#/about" class="nav-keep ${active === 'about' ? 'active' : ''}">About this demo</a>
        <button class="theme-toggle" id="themeToggle" title="Toggle theme"
          aria-label="Toggle colour theme">${ICONS.sun}</button>
      </nav>
    </div>
  </header>
  </div>`;
}

export function footer() {
  return `
  <footer class="site-footer">
    <div class="wrap">
      <span><strong>Traceline</strong> — a synthetic-data demo</span>
      <span class="spacer"></span>
      <a href="#/about">About</a>
      <a href="#/pricing">Plans</a>
      <span style="color:var(--text-3)">Invented data only. No real people, no real records, not a consumer report.</span>
    </div>
  </footer>`;
}
