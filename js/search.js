// Query layer over the synthetic population.
//
// The index is built once at boot and kept in memory. At ~2.4k records a
// linear scan is far below the frame budget, so the index exists mainly to
// pre-normalize strings rather than to make the scan asymptotically faster.

const norm = s => (s || '').toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');

export function buildIndex(people) {
  const byLast = new Map();
  for (const p of people) {
    p._nFirst = norm(p.first);
    p._nLast = norm(p.last);
    p._nFull = norm(`${p.first} ${p.middle} ${p.last}`);
    p._nAliases = p.aliases.map(norm);
    p._nCity = norm(p.city);
    const key = p._nLast;
    if (!byLast.has(key)) byLast.set(key, []);
    byLast.get(key).push(p);
  }
  return { people, byLast };
}

/**
 * Score one record against a query. Returns 0 for "not a match" so the caller
 * can filter on truthiness; higher is a better match.
 */
function score(p, q) {
  const { first, last, city, state, ageMin, ageMax } = q;
  let s = 0;

  if (last) {
    if (p._nLast === last) s += 100;
    else if (p._nLast.startsWith(last)) s += 55;
    else if (p._nAliases.some(a => a.endsWith(' ' + last))) s += 40;
    else return 0;
  }

  if (first) {
    if (p._nFirst === first) s += 80;
    else if (p._nFirst.startsWith(first)) s += 45;
    else if (p._nAliases.some(a => a.startsWith(first + ' '))) s += 30;
    else return 0;
  }

  // A bare single-token query with no surname field: match either name part.
  if (!first && !last && q.free) {
    const f = q.free;
    if (p._nFull.includes(f)) s += 60;
    else if (p._nAliases.some(a => a.includes(f))) s += 35;
    else return 0;
  }

  if (state) {
    // State is a hard filter against current residence or any prior address.
    const lived = p.state === state || p.addresses.some(a => a.state === state);
    if (!lived) return 0;
    s += p.state === state ? 25 : 8;
  }

  if (city) {
    const lived = p._nCity === city || p.addresses.some(a => norm(a.city) === city);
    if (!lived) return 0;
    s += p._nCity === city ? 20 : 6;
  }

  if (ageMin != null && p.age < ageMin) return 0;
  if (ageMax != null && p.age > ageMax) return 0;

  // Nudge better-corroborated records up so the first page looks credible.
  s += p.confidence / 20;
  s += Math.min(p.addresses.length, 4);
  return s;
}

export function search(index, raw) {
  const q = {
    first: norm(raw.first),
    last: norm(raw.last),
    city: norm(raw.city),
    state: (raw.state || '').trim().toUpperCase(),
    free: norm(raw.free),
    ageMin: raw.ageMin ? Number(raw.ageMin) : null,
    ageMax: raw.ageMax ? Number(raw.ageMax) : null
  };

  if (!q.first && !q.last && !q.free) return { results: [], query: q };

  // Fast path: an exact surname narrows the candidate set immediately.
  const pool = (q.last && index.byLast.has(q.last))
    ? index.byLast.get(q.last)
    : index.people;

  const scored = [];
  for (const p of pool) {
    const s = score(p, q);
    if (s > 0) scored.push({ p, s });
  }
  // Fall back to the full set if the surname fast path found nothing
  // (covers prefix matches like "john" -> "Johnson").
  if (!scored.length && pool !== index.people) {
    for (const p of index.people) {
      const s = score(p, q);
      if (s > 0) scored.push({ p, s });
    }
  }

  scored.sort((a, b) => b.s - a.s || a.p.displayName.localeCompare(b.p.displayName));
  return { results: scored.map(x => x.p), query: q };
}

export function statesInUse(people) {
  return [...new Set(people.map(p => p.state))].sort();
}
