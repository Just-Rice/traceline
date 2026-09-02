// Landing, results, pricing and about views.

import { esc, initials, confidencePill, ICONS } from './ui.js';

export const PAGE_SIZE = 10;

export function homeView(states) {
  return `
  <section class="hero">
    <div class="wrap">
      <h1>Find the person behind the name.</h1>
      <p class="lede">
        Traceline searches a database of public-record style profiles and assembles
        them into a single readable report — addresses, relatives, work history and
        contact details in one place, each field labelled with the feed it came from.
      </p>
      <div class="search-card">
        <form id="searchForm">
          <div class="search-grid">
            <div class="field">
              <label for="q-first">First name</label>
              <input id="q-first" name="first" autocomplete="off" placeholder="e.g. Michael">
            </div>
            <div class="field">
              <label for="q-last">Last name</label>
              <input id="q-last" name="last" autocomplete="off" placeholder="e.g. Ramirez">
            </div>
            <div class="field">
              <label for="q-state">State</label>
              <select id="q-state" name="state">
                <option value="">All states</option>
                ${states.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-lg" type="submit">Search</button>
          </div>
        </form>
      </div>
      <p style="margin:14px 0 0;font-size:13.5px;color:var(--text-3)">
        Try <a href="#/results?last=Jackson">Jackson</a>,
        <a href="#/results?first=Elizabeth&amp;last=Johnson">Elizabeth Johnson</a>
        (four people share that name), or
        <a href="#/results?last=Peterson&amp;state=VA">Peterson in Virginia</a>.
      </p>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <h2 class="section-title">What a report pulls together</h2>
      <p class="section-sub">
        A single name is a weak identifier. The work of a people-search product is
        joining scattered fragments into one profile — and being honest about how
        confident that join actually is.
      </p>
      <div class="cols-3">
        <div class="feature">
          <div class="icon">${ICONS.layers}</div>
          <h3>Layered sources</h3>
          <p>Address history, employment, licenses and filings each arrive from a
             different kind of source, with different freshness and reliability.</p>
        </div>
        <div class="feature">
          <div class="icon">${ICONS.link}</div>
          <h3>Entity resolution</h3>
          <p>Deciding that two records describe the same person is the hard part.
             Every profile here carries a visible confidence score instead of
             pretending the match is certain.</p>
        </div>
        <div class="feature">
          <div class="icon">${ICONS.shield}</div>
          <h3>Stated limits</h3>
          <p>No criminal history, no credit data, no scraping. The demo shows the
             product shape without building the machinery that makes it risky.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="band alt">
    <div class="wrap-narrow" style="padding:0 20px">
      <h2 class="section-title">This is a demo, and the data is invented</h2>
      <p class="section-sub" style="margin-bottom:18px">
        Traceline is a front-end study of how people-search products are built and
        how they persuade. It runs entirely in your browser against 2,400+
        procedurally generated profiles. There is no backend, no data broker feed,
        and nothing here corresponds to a real human being.
      </p>
      <a class="btn btn-ghost" href="#/about">Read what is and isn't real</a>
    </div>
  </section>`;
}

export function scannerView(name) {
  const steps = [
    'Normalizing the query',
    'Searching name and alias index',
    'Matching address history',
    'Resolving relatives and associates',
    'Scoring match confidence',
    'Assembling results'
  ];
  return `
  <div class="scanner">
    <h2>Searching for ${esc(name)}</h2>
    <p>Scanning the synthetic record set.</p>
    <div class="scan-bar"><div class="scan-fill" id="scanFill"></div></div>
    <div class="scan-steps" id="scanSteps">
      ${steps.map((s, i) => `
        <div class="scan-step" data-step="${i}">
          <span class="dot"></span><span>${s}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function resultCard(p) {
  const rels = p.relatives.slice(0, 3).map(r => r.id);
  return `
  <div class="result-card">
    <div class="avatar">${initials(p)}</div>
    <div>
      <div class="result-name">${esc(p.fullName)}</div>
      <div class="result-meta">${p.age} years old · ${esc(p.city)}, ${esc(p.state)}</div>
      <div class="result-lines">
        ${p.aliases.length
          ? `<div>Also known as <strong>${esc(p.aliases.slice(0, 2).join(', '))}</strong></div>` : ''}
        <div>Lived in <strong>${esc([...new Set(p.addresses.map(a => `${a.city}, ${a.state}`))]
            .slice(0, 3).join(' · '))}</strong></div>
        <div>${p.relatives.length} relative${p.relatives.length === 1 ? '' : 's'} ·
             ${p.phones.length} phone${p.phones.length === 1 ? '' : 's'} ·
             ${p.emails.length} email${p.emails.length === 1 ? '' : 's'}</div>
      </div>
      <div style="margin-top:10px">${confidencePill(p.confidence)}</div>
    </div>
    <div class="result-action">
      <a class="btn" href="#/report/${p.id}">View report</a>
      <span style="font-size:12px;color:var(--text-3);text-align:center">Updated ${esc(p.lastUpdated)}</span>
    </div>
  </div>`;
}

export function resultsView(results, query, page, qs) {
  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  page = Math.min(Math.max(1, page), pages);
  const slice = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const label = [query.first, query.last].filter(Boolean)
    .map(s => s.replace(/\b\w/g, c => c.toUpperCase())).join(' ') || query.free || 'your search';

  const mkLink = n => {
    const u = new URLSearchParams(qs);
    u.set('page', n);
    return `#/results?${u.toString()}`;
  };

  return `
  <div class="wrap">
    <div class="results-head">
      <h1>${total} ${total === 1 ? 'match' : 'matches'} for ${esc(label)}${
        query.state ? ` in ${esc(query.state)}` : ''}</h1>
      <p>Ranked by match strength. <a href="#/">Refine this search</a></p>
    </div>

    ${total === 0 ? `
      <div class="empty">
        <h2>No records matched</h2>
        <p>Try a surname on its own, or drop the state filter.<br>
           Well-represented surnames here include Jackson, Peterson, Stewart,
           Alvarez and Morales.</p>
        <p style="margin-top:18px"><a class="btn btn-ghost" href="#/">Start a new search</a></p>
      </div>` : slice.map(resultCard).join('')}

    ${pages > 1 ? `
      <div class="pager">
        ${page > 1 ? `<a class="btn btn-ghost" href="${mkLink(page - 1)}">Previous</a>` : ''}
        <span class="btn btn-ghost" style="cursor:default">Page ${page} of ${pages}</span>
        ${page < pages ? `<a class="btn btn-ghost" href="${mkLink(page + 1)}">Next</a>` : ''}
      </div>` : '<div style="height:40px"></div>'}
  </div>`;
}

export function pricingView() {
  const plans = [
    { name: 'Preview', price: 'Free', note: 'Name, age, city — the hook', featured: false,
      items: ['Name and approximate age', 'Current city', 'Count of records found',
              'Blurred everything else'] },
    { name: 'Full report', price: '$4', unit: '/ report', note: 'The upsell',
      featured: true,
      items: ['Phone numbers and emails', 'Full address history', 'Relatives and associates',
              'Vehicles, licenses, filings', 'Source provenance'] },
    { name: 'Monitor', price: '$19', unit: '/ month', note: 'The retention play',
      featured: false,
      items: ['Unlimited reports', 'Change alerts on watched profiles',
              'Bulk lookup', 'Export to CSV'] }
  ];

  return `
  <div class="wrap" style="padding-top:34px;padding-bottom:60px">
    <h1 class="section-title" style="font-size:26px">How this genre prices itself</h1>
    <p class="section-sub">
      The pricing ladder is the most studied part of these products. The free tier
      is calibrated to prove the data exists without being useful; the paid tier
      sells the identifiers; the subscription converts a one-off worry into a
      recurring charge. It is worth seeing laid out plainly.
    </p>

    <div class="notice">
      <strong>Traceline charges nothing and gates nothing.</strong> Every report
      here shows every field it has, including provenance. The tiers below are
      documentation of a pattern, not an offer — there is no checkout, no account
      and no payment form anywhere in this demo.
    </div>

    <div class="plans">
      ${plans.map(pl => `
        <div class="plan ${pl.featured ? 'featured' : ''}">
          ${pl.featured ? '<span class="plan-tag">Typical upsell</span>' : ''}
          <h3>${pl.name}</h3>
          <div class="price">${pl.price}${pl.unit ? `<span>${pl.unit}</span>` : ''}</div>
          <div class="note">${pl.note}</div>
          <ul>
            ${pl.items.map(i => `<li>${ICONS.check}<span>${i}</span></li>`).join('')}
          </ul>
          <span class="plan-foot">Not billable in this demo</span>
        </div>`).join('')}
    </div>

    <h2 class="section-title" style="font-size:19px;margin-top:38px">Why the paywall usually sits where it does</h2>
    <p class="section-sub" style="margin-bottom:0">
      Note which fields land in the paid tier: phone numbers, emails, addresses.
      Those are the contact identifiers — the ones that let a buyer actually reach
      or locate the person. The free tier gives away everything that builds
      confidence the record is real, and withholds everything that makes it
      actionable. That split is the business model in one line, and it is the
      reason this demo does not reproduce it.
    </p>
  </div>`;
}

export function aboutView(stats) {
  return `
  <div class="wrap-narrow" style="padding-top:34px;padding-bottom:70px">
    <h1 class="section-title" style="font-size:26px">About this demo</h1>
    <div class="prose">
      <p>
        Traceline is a working front-end for a people-search product, built as a
        study of the genre. It reproduces the shape of these sites — the search,
        the progress theatre, the teaser results, the tabbed report, the paywall —
        without any of the underlying data collection.
      </p>

      <div class="notice">
        <strong>Every record is fabricated.</strong> The
        ${stats.people.toLocaleString()} profiles in this app are generated at page
        load from a fixed seed. No record was scraped, purchased, or matched against
        a real person, and no data leaves your browser.
      </div>

      <h2>How the data is made</h2>
      <p>
        A seeded pseudo-random generator builds ${stats.households.toLocaleString()}
        households. Each gets a surname, a home city, one or two adults and
        sometimes adult children, then the generator links spouses, parents,
        children and siblings to each other, and adds cross-household "associates"
        drawn from the same city. Address histories walk backwards in time, weighted
        toward staying in the same region — which is what produces profiles that
        feel plausible rather than random.
      </p>
      <p>
        Because the seed is fixed, the dataset is identical on every load. That is
        what lets a report URL like <code>#/report/p00412</code> keep working
        without a server behind it.
      </p>

      <h2>What was deliberately left out</h2>
      <ul>
        <li><strong>Real data of any kind.</strong> No scraping, no broker feeds, no
            public-record ingestion, no matching against real identities.</li>
        <li><strong>Criminal history.</strong> Real people-search products lean on
            it heavily, and it is where a bad identity match does the most harm to
            a real person. The generator produces civil and administrative filings
            only.</li>
        <li><strong>Payments and paywalls.</strong> Nothing is gated. Every report
            shows every field it holds, with provenance attached. The
            <a href="#/pricing">Plans</a> page documents the usual pricing ladder
            rather than implementing it.</li>
        <li><strong>Social security numbers, credit data, and exact dates of
            birth.</strong> The report shows a birth month and year and nothing
            finer.</li>
      </ul>

      <h2>If you wanted to ship something like this for real</h2>
      <p>
        The front end is the easy half. A real product in this category is regulated
        infrastructure: the Fair Credit Reporting Act governs how these reports may
        be used for employment, housing and credit decisions; several states now
        require data brokers to register and to honour deletion requests; and every
        upstream source carries its own terms. The engineering problem that actually
        matters is entity resolution — deciding when two records describe the same
        person — and getting it wrong attaches someone else's history to a real
        human's name.
      </p>
      <p>
        That is the reason this demo stops where it does. The interface is the
        interesting, reusable part. The data pipeline is the part that carries the
        obligations.
      </p>

      <h2>Stack</h2>
      <p>
        Vanilla HTML, CSS and ES modules. No dependencies, no build step, no
        network calls. Hash-based routing so it deploys to static hosting as-is.
      </p>

      <h3>Dataset at a glance</h3>
      <ul>
        <li>${stats.people.toLocaleString()} people across
            ${stats.households.toLocaleString()} households</li>
        <li>${stats.cities} cities in ${stats.states} states</li>
        <li>${stats.relations.toLocaleString()} family links,
            ${stats.assocs.toLocaleString()} associate links</li>
        <li>Built in ${stats.ms} ms at page load</li>
      </ul>
    </div>
  </div>`;
}
