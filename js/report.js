// Report view.
//
// Every field the generator produces is rendered somewhere in this file, and
// every one carries its provenance. That is the whole argument of the demo:
// a people-search report is only as trustworthy as the feeds behind it, so the
// feeds belong on the page rather than hidden behind a paywall.

import { esc, initials, yearsSpan, confidencePill, srcTag, ICONS } from './ui.js';
import { SOURCE_BY_ID, SOURCES } from './pools.js';

// Labels are kept short so all eight tabs fit one desktop row — an overflowing
// tab bar hid the Sources tab entirely at 1080px.
const TABS = [
  ['overview',  'Overview'],
  ['contact',   'Contact'],
  ['addresses', 'Addresses'],
  ['people',    'Relatives'],
  ['work',      'Work'],
  ['assets',    'Assets'],
  ['records',   'Filings'],
  ['sources',   'Sources']
];

/* ---------- provenance collection ---------- */

// Walk the record and flatten every field into a provenance row. Also used to
// drive the per-source rollup, so the two views can never disagree.
export function provenanceRows(p, byId) {
  const rows = [];
  const add = (section, field, value, src, observed) =>
    rows.push({ section, field, value, src, observed });

  add('Identity', 'Legal name', p.fullName, p.identitySrc, p.identityObserved);
  add('Identity', 'Date of birth', `${p.birthMonth} ${p.birthYear}`, p.identitySrc, p.identityObserved);
  for (const a of p.aliases) add('Identity', 'Alternate name', a, 'crawl', p.identityObserved);

  for (const ph of p.phones) add('Contact', `Phone (${ph.kind})`, ph.number, ph.src, ph.observed);
  for (const em of p.emails) add('Contact', 'Email', em.address, em.src, em.observed);
  for (const so of p.socials) add('Contact', `Profile (${so.network})`, so.url, so.src, so.observed);

  for (const ad of p.addresses)
    add('Address', `${ad.type} residence`, `${ad.line1}, ${ad.city}, ${ad.state} ${ad.zip}`, ad.src, ad.observed);

  for (const e of p.employment)
    add('Employment', e.title, e.employer, e.src, e.observed);
  for (const e of p.education)
    add('Education', e.kind, e.school, e.src, e.observed);

  for (const v of p.vehicles)
    add('Assets', 'Vehicle', `${v.year} ${v.make} ${v.model} · ${v.plate}`, v.src, v.observed);
  for (const l of p.licenses)
    add('Licenses', l.name, l.status, l.src, l.observed);
  for (const b of p.businesses)
    add('Business', b.role, b.name, b.src, b.observed);
  for (const c of p.courtRecords)
    add('Court', c.type, `${c.caseNumber} (${c.disposition})`, c.src, c.observed);

  const nameOf = id => (byId && byId.get(id)) ? byId.get(id).displayName : id;
  for (const rel of p.relatives)
    add('Relations', rel.relation, nameOf(rel.id), rel.src, p.identityObserved);
  for (const as of p.associates)
    add('Relations', as.basis, nameOf(as.id), as.src, p.identityObserved);

  return rows;
}

function sourceRollup(p, byId) {
  const rows = provenanceRows(p, byId);
  const map = new Map();
  for (const r of rows) {
    if (!r.src) continue;
    if (!map.has(r.src)) map.set(r.src, { id: r.src, fields: 0, latest: 0, sections: new Set() });
    const e = map.get(r.src);
    e.fields++;
    e.latest = Math.max(e.latest, r.observed || 0);
    e.sections.add(r.section);
  }
  return [...map.values()]
    .map(e => ({ ...e, meta: SOURCE_BY_ID[e.id] }))
    .filter(e => e.meta)
    .sort((a, b) => b.fields - a.fields);
}

/* ---------- per-tab bodies ---------- */

function overview(p, byId) {
  const current = p.addresses[0];
  const rel = p.relatives.slice(0, 4).map(r => byId.get(r.id)).filter(Boolean);
  const feeds = sourceRollup(p, byId);
  const totalFields = provenanceRows(p, byId).length;

  return `
  <div class="panel">
    <div class="panel-head"><h2>Identity summary</h2>${confidencePill(p.confidence)}</div>
    <div class="panel-body">
      <dl class="kv">
        <dt>Full name</dt><dd>${esc(p.fullName)} ${srcTag(p.identitySrc, p.identityObserved)}</dd>
        <dt>Goes by</dt><dd>${esc(p.displayName)}</dd>
        <dt>Age</dt><dd>${p.age} <span style="color:var(--text-3)">(born ${esc(p.birthMonth)} ${p.birthYear})</span></dd>
        <dt>Listed gender</dt><dd>${p.gender === 'M' ? 'M' : 'F'} <span style="color:var(--text-3)">— as recorded by the source feed</span></dd>
        <dt>Current city</dt><dd>${esc(p.city)}, ${esc(p.state)}</dd>
        <dt>Also known as</dt><dd>${p.aliases.length
            ? p.aliases.map(a => `<span class="chip">${esc(a)}</span>`).join(' ')
            : '<span style="color:var(--text-3)">No alternate names on file</span>'}</dd>
        <dt>Record last updated</dt><dd>${esc(p.lastUpdated)}</dd>
        <dt>Record ID</dt><dd class="mono">${esc(p.id)}</dd>
        <dt>Corroborating feeds</dt><dd>${feeds.length} source${feeds.length === 1 ? '' : 's'}
          across ${totalFields} field${totalFields === 1 ? '' : 's'} —
          <a href="#/report/${p.id}?tab=sources">see provenance</a></dd>
      </dl>
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>What this report contains</h2>
      <span class="pill">Everything below is included</span></div>
    <div class="panel-body">
      <div class="rows">
        ${[
          ['Phone numbers', p.phones.length, 'contact'],
          ['Email addresses', p.emails.length, 'contact'],
          ['Online profiles', p.socials.length, 'contact'],
          ['Address history', p.addresses.length, 'addresses'],
          ['Relatives', p.relatives.length, 'people'],
          ['Possible associates', p.associates.length, 'people'],
          ['Employment entries', p.employment.length, 'work'],
          ['Education entries', p.education.length, 'work'],
          ['Vehicles', p.vehicles.length, 'assets'],
          ['Professional licenses', p.licenses.length, 'assets'],
          ['Business registrations', p.businesses.length, 'assets'],
          ['Civil filings', p.courtRecords.length, 'records']
        ].map(([label, n, tab]) => `
          <div class="row">
            <div><div class="primary">${n > 0
              ? `<a href="#/report/${p.id}?tab=${tab}">${label}</a>` : label}</div></div>
            <div class="aside">${n === 0 ? 'None found' : `${n} record${n === 1 ? '' : 's'}`}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  ${current ? `
  <div class="panel">
    <div class="panel-head"><h2>Most recent address</h2><span class="pill">${esc(current.type)}</span></div>
    <div class="panel-body">
      <div class="row" style="border:none">
        <div>
          <div class="primary">${esc(current.line1)}</div>
          <div class="secondary">${esc(current.city)}, ${esc(current.state)} ${esc(current.zip)}
            ${srcTag(current.src, current.observed)}</div>
        </div>
        <div class="aside">${yearsSpan(current.fromYear, current.toYear)}</div>
      </div>
    </div>
  </div>` : ''}

  ${rel.length ? `
  <div class="panel">
    <div class="panel-head"><h2>Closest relatives</h2>
      <a href="#/report/${p.id}?tab=people" style="margin-left:auto;font-size:13.5px">View all</a></div>
    <div class="panel-body">
      <div class="people-grid">
        ${rel.map((q, i) => personChip(q, p.relatives[i].relation)).join('')}
      </div>
    </div>
  </div>` : ''}`;
}

function personChip(q, sub) {
  return `
  <a class="person-chip" href="#/report/${q.id}">
    <span class="avatar">${initials(q)}</span>
    <span>
      <span class="nm">${esc(q.displayName)}</span><br>
      <span class="rel">${esc(sub)} · ${esc(q.city)}, ${esc(q.state)} · ${q.age}</span>
    </span>
  </a>`;
}

const emptyLine = msg => `<p style="color:var(--text-3);padding:12px 0">${msg}</p>`;

function contact(p) {
  return `
  <div class="panel">
    <div class="panel-head"><h2>Phone numbers</h2><span class="pill">${p.phones.length}</span></div>
    <div class="panel-body">${p.phones.length ? `<div class="rows">
      ${p.phones.map(ph => `
        <div class="row">
          <div>
            <div class="primary mono" style="font-size:14.5px">${esc(ph.number)}</div>
            <div class="secondary">${esc(ph.kind)} · ${esc(ph.lineType)}
              ${srcTag(ph.src, ph.observed)}</div>
          </div>
          <div class="aside">Last seen ${esc(ph.lastSeen)}</div>
        </div>`).join('')}
    </div>` : emptyLine('No phone numbers found.')}</div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Email addresses</h2><span class="pill">${p.emails.length}</span></div>
    <div class="panel-body">${p.emails.length ? `<div class="rows">
      ${p.emails.map(em => `
        <div class="row">
          <div>
            <div class="primary mono" style="font-size:14px">${esc(em.address)}</div>
            <div class="secondary">${srcTag(em.src, em.observed)}</div>
          </div>
          <div class="aside">${esc(em.status)}</div>
        </div>`).join('')}
    </div>` : emptyLine('No email addresses found.')}</div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Possible online profiles</h2><span class="pill">${p.socials.length}</span></div>
    <div class="panel-body">
      ${p.socials.length ? `<div class="rows">
        ${p.socials.map(s => `
          <div class="row">
            <div>
              <div class="primary">${esc(s.network)}</div>
              <div class="secondary mono">${esc(s.url)}</div>
              <div class="secondary">${srcTag(s.src, s.observed)}</div>
            </div>
            <div class="aside">Active ${esc(s.lastActive)}</div>
          </div>`).join('')}
      </div>` : emptyLine('No profiles matched.')}
    </div>
  </div>`;
}

function addresses(p) {
  return `
  <div class="panel">
    <div class="panel-head"><h2>Address history</h2><span class="pill">${p.addresses.length} on file</span></div>
    <div class="panel-body"><div class="rows">
      ${p.addresses.map((a, i) => `
        <div class="row">
          <div>
            <div class="primary">${esc(a.line1)}${i === 0
              ? ' <span class="pill ok" style="margin-left:6px">Current</span>' : ''}</div>
            <div class="secondary">${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)} · ${esc(a.type)}
              ${srcTag(a.src, a.observed)}</div>
          </div>
          <div class="aside">${yearsSpan(a.fromYear, a.toYear)}</div>
        </div>`).join('')}
    </div></div>
  </div>`;
}

function people(p, byId) {
  const block = (title, list, keyName, note) => `
    <div class="panel">
      <div class="panel-head"><h2>${title}</h2><span class="pill">${list.length}</span></div>
      <div class="panel-body">
        ${note ? `<p class="panel-note">${note}</p>` : ''}
        ${list.length ? `<div class="rows">
          ${list.map(x => {
            const q = byId.get(x.id);
            if (!q) return '';
            return `<div class="row">
              <div style="display:flex;gap:11px;align-items:center">
                <a class="person-chip" href="#/report/${q.id}" style="border:none;padding:0">
                  <span class="avatar">${initials(q)}</span>
                  <span>
                    <span class="nm">${esc(q.displayName)}</span><br>
                    <span class="rel">${esc(x[keyName])} · ${esc(q.city)}, ${esc(q.state)} · age ${q.age}</span>
                  </span>
                </a>
              </div>
              <div class="aside">${srcTag(x.src)}</div>
            </div>`;
          }).join('')}
        </div>` : emptyLine('None found.')}
      </div>
    </div>`;
  return block('Relatives', p.relatives, 'relation',
      'Family links are inferred from household composition and archive records, not asserted by the people themselves.') +
    block('Possible associates', p.associates, 'basis',
      'Associates are weak links — a shared address or phone record over time. Treat them as leads, not facts.');
}

function work(p) {
  return `
  <div class="panel">
    <div class="panel-head"><h2>Employment</h2><span class="pill">${p.employment.length}</span></div>
    <div class="panel-body">
      ${p.employment.length ? `<div class="rows">
        ${p.employment.map(e => `
          <div class="row">
            <div>
              <div class="primary">${esc(e.title)}</div>
              <div class="secondary">${esc(e.employer)} ${srcTag(e.src, e.observed)}</div>
            </div>
            <div class="aside">${yearsSpan(e.fromYear, e.toYear)}</div>
          </div>`).join('')}
      </div>` : emptyLine('No employment records found.')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Education</h2><span class="pill">${p.education.length}</span></div>
    <div class="panel-body">
      ${p.education.length ? `<div class="rows">
        ${p.education.map(e => `
          <div class="row">
            <div>
              <div class="primary">${esc(e.school)}</div>
              <div class="secondary">${esc(e.kind)} ${srcTag(e.src, e.observed)}</div>
            </div>
            <div class="aside">Class of ${e.gradYear}</div>
          </div>`).join('')}
      </div>` : emptyLine('No education records found.')}
    </div>
  </div>`;
}

function assets(p) {
  return `
  <div class="panel">
    <div class="panel-head"><h2>Vehicles</h2><span class="pill">${p.vehicles.length}</span></div>
    <div class="panel-body">
      ${p.vehicles.length ? `<div class="rows">
        ${p.vehicles.map(v => `
          <div class="row">
            <div>
              <div class="primary">${v.year} ${esc(v.make)} ${esc(v.model)}</div>
              <div class="secondary">${esc(v.color)} ${srcTag(v.src, v.observed)}</div>
            </div>
            <div class="aside mono">${esc(v.plate)}</div>
          </div>`).join('')}
      </div>` : emptyLine('No vehicles found.')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Professional licenses</h2><span class="pill">${p.licenses.length}</span></div>
    <div class="panel-body">
      ${p.licenses.length ? `<div class="rows">
        ${p.licenses.map(l => `
          <div class="row">
            <div>
              <div class="primary">${esc(l.name)}</div>
              <div class="secondary">Issued ${l.issuedYear} ${srcTag(l.src, l.observed)}</div>
            </div>
            <div class="aside">${esc(l.status)}</div>
          </div>`).join('')}
      </div>` : emptyLine('No licenses found.')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Business registrations</h2><span class="pill">${p.businesses.length}</span></div>
    <div class="panel-body">
      ${p.businesses.length ? `<div class="rows">
        ${p.businesses.map(b => `
          <div class="row">
            <div>
              <div class="primary">${esc(b.name)}</div>
              <div class="secondary">${esc(b.role)} · filed ${b.filedYear} ${srcTag(b.src, b.observed)}</div>
            </div>
            <div class="aside">${esc(b.status)}</div>
          </div>`).join('')}
      </div>` : emptyLine('No business filings found.')}
    </div>
  </div>`;
}

function records(p) {
  return `
  <div class="notice">
    <strong>Scope note.</strong> This demo generates civil and administrative
    filings only — small claims, liens, traffic, name changes. It deliberately
    does not invent criminal history, which is the part of a real people-search
    product that does the most damage when it is wrong or mismatched.
  </div>
  <div class="panel">
    <div class="panel-head"><h2>Civil &amp; administrative filings</h2>
      <span class="pill">${p.courtRecords.length}</span></div>
    <div class="panel-body">
      ${p.courtRecords.length ? `<div class="rows">
        ${p.courtRecords.map(c => `
          <div class="row">
            <div>
              <div class="primary">${esc(c.type)}</div>
              <div class="secondary mono">Case ${esc(c.caseNumber)} · filed ${c.filedYear}</div>
              <div class="secondary">${srcTag(c.src, c.observed)}</div>
            </div>
            <div class="aside">${esc(c.disposition)}</div>
          </div>`).join('')}
      </div>` : emptyLine('No filings found.')}
    </div>
  </div>`;
}

/* ---------- sources tab ---------- */

const RELIABILITY_CLASS = { High: 'ok', Medium: '', Low: 'mid' };

function sources(p, byId) {
  const feeds = sourceRollup(p, byId);
  const rows = provenanceRows(p, byId);
  const unused = SOURCES.filter(s => !feeds.some(f => f.id === s.id));

  // Group the flat provenance list by section for readability.
  const bySection = new Map();
  for (const r of rows) {
    if (!bySection.has(r.section)) bySection.set(r.section, []);
    bySection.get(r.section).push(r);
  }

  return `
  <div class="notice">
    <strong>These feeds are fictional too.</strong> A real product in this
    category buys or scrapes from county recorders, credit header files,
    marketing panels and court aggregators. Traceline names invented equivalents
    so the <em>shape</em> of provenance is visible — which feed asserted a field,
    how often it refreshes, and how much weight it deserves.
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Feeds contributing to this record</h2>
      <span class="pill">${feeds.length} of ${SOURCES.length}</span></div>
    <div class="panel-body">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Source</th><th>Category</th><th>Refresh</th>
              <th>Reliability</th><th class="num">Fields</th><th>Contributes to</th><th class="num">Latest</th>
            </tr>
          </thead>
          <tbody>
            ${feeds.map(f => `
              <tr>
                <td><strong>${esc(f.meta.name)}</strong></td>
                <td>${esc(f.meta.kind)}</td>
                <td>${esc(f.meta.cadence)}</td>
                <td><span class="pill ${RELIABILITY_CLASS[f.meta.reliability]}">${esc(f.meta.reliability)}</span></td>
                <td class="num">${f.fields}</td>
                <td>${[...f.sections].map(x => `<span class="chip sm">${esc(x)}</span>`).join(' ')}</td>
                <td class="num">${f.latest || '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Field-level provenance</h2>
      <span class="pill">${rows.length} fields</span></div>
    <div class="panel-body">
      <p class="panel-note">
        Every value in this report, and the feed that asserted it. A field
        supported by one low-reliability source is exactly the kind of claim that
        attaches the wrong history to the wrong person.
      </p>
      ${[...bySection.entries()].map(([section, list]) => `
        <h3 class="subhead">${esc(section)} <span class="count">${list.length}</span></h3>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Field</th><th>Value</th><th>Source</th><th class="num">Observed</th></tr></thead>
            <tbody>
              ${list.map(r => {
                const m = SOURCE_BY_ID[r.src];
                return `<tr>
                  <td>${esc(r.field)}</td>
                  <td class="wrap-cell">${esc(r.value)}</td>
                  <td>${m ? `${esc(m.name)} <span class="pill ${RELIABILITY_CLASS[m.reliability]}">${esc(m.reliability)}</span>`
                          : '<span style="color:var(--text-3)">Unattributed</span>'}</td>
                  <td class="num">${r.observed || '—'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`).join('')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Feeds with no data on this person</h2>
      <span class="pill">${unused.length}</span></div>
    <div class="panel-body">
      <p class="panel-note">
        A gap is information too. These feeds were consulted and returned nothing
        — which is different from the person not appearing in them at all.
      </p>
      <div class="chips">
        ${unused.length ? unused.map(s => `<span class="chip">${esc(s.name)}</span>`).join('')
                        : '<span style="color:var(--text-3)">Every feed contributed something.</span>'}
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Internal join keys</h2></div>
    <div class="panel-body">
      <p class="panel-note">
        Normally hidden. Shown here because the join is the part that decides
        whether this report describes one person or accidentally merges two.
      </p>
      <dl class="kv">
        <dt>Record ID</dt><dd class="mono">${esc(p.id)}</dd>
        <dt>Household cluster</dt><dd class="mono">${esc(p.householdId)}</dd>
        <dt>Region bucket</dt><dd class="mono">${esc(p.region)}</dd>
        <dt>Match confidence</dt><dd>${confidencePill(p.confidence)}</dd>
        <dt>Distinct feeds</dt><dd>${feeds.length}</dd>
        <dt>Total asserted fields</dt><dd>${rows.length}</dd>
      </dl>
    </div>
  </div>`;
}

/* ---------- shell ---------- */

const BODIES = { overview, contact, addresses, people, work, assets, records, sources };

const COUNTS = {
  contact: p => p.phones.length + p.emails.length + p.socials.length,
  addresses: p => p.addresses.length,
  people: p => p.relatives.length + p.associates.length,
  work: p => p.employment.length + p.education.length,
  assets: p => p.vehicles.length + p.licenses.length + p.businesses.length,
  records: p => p.courtRecords.length,
  sources: p => sourceRollup(p).length   // count is feed-only, byId not needed
};

export function renderReport(p, byId, tab = 'overview') {
  if (!BODIES[tab]) tab = 'overview';
  const body = BODIES[tab](p, byId);

  return `
  <div class="report-header">
    <div class="wrap">
      <div class="report-id">
        <div class="avatar-lg">${initials(p)}</div>
        <div>
          <h1>${esc(p.fullName)}</h1>
          <div class="sub">${p.age} years old · ${esc(p.city)}, ${esc(p.state)}</div>
          <div class="report-badges">
            ${confidencePill(p.confidence)}
            <span class="pill">Updated ${esc(p.lastUpdated)}</span>
            <span class="pill ok">Full report</span>
          </div>
        </div>
      </div>
      <div class="tabs-wrap"><div class="tabs" role="tablist">
        ${TABS.map(([id, label]) => {
          const c = COUNTS[id] ? COUNTS[id](p) : null;
          return `<button class="tab" role="tab" data-tab="${id}"
            aria-selected="${id === tab}">${label}${
            c ? `<span class="count">${c}</span>` : ''}</button>`;
        }).join('')}
      </div></div>
    </div>
  </div>
  <div class="report-body">
    <div class="wrap">
      ${body}
      <p style="color:var(--text-3);font-size:13px;margin-top:22px">
        Record <span class="mono">${esc(p.id)}</span> — generated from seed data.
        This describes no living person.
      </p>
    </div>
  </div>`;
}
