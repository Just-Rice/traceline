// Deterministic synthetic population builder.
//
// Everything is derived from a single integer seed, so the same dataset is
// rebuilt byte-for-byte on every page load. That is what lets a report URL
// like #/report/p0412 stay valid across sessions without a server.
//
// The people, addresses, employers, schools, plates and case numbers below do
// not exist. Surnames are drawn from a common-name list, but no record is
// sourced from, or matched against, any real person.

import {
  FIRST_M, FIRST_F, MIDDLE, LAST, CITIES, STREETS, STREET_TYPE, UNIT_TYPE,
  EMAIL_HOSTS, EMPLOYERS, JOB_TITLES, SCHOOLS, COLLEGES, SOCIAL_NETS,
  CAR_MAKES, COLORS, LICENSES, COURT_TYPES, BIZ_SUFFIX, SOURCES
} from './pools.js';

const CURRENT_YEAR = 2026;

/* ---------- seeded randomness (mulberry32) ---------- */

function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: arr => arr[Math.floor(next() * arr.length)],
    chance: p => next() < p,
    shuffle(arr) {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
    sample(arr, n) { return this.shuffle(arr).slice(0, n); }
  };
}

/* ---------- small field builders ---------- */

const pad = (n, w) => String(n).padStart(w, '0');

function areaCodeFor(state) {
  // Stable pseudo area code per state. Deliberately not a real NANP mapping.
  const base = state.charCodeAt(0) * 7 + state.charCodeAt(1) * 3;
  return 200 + (base % 700);
}

function makePhone(r, state, kind) {
  return {
    number: `(${areaCodeFor(state)}) ${r.int(200, 989)}-${pad(r.int(0, 9999), 4)}`,
    kind,
    // Line type follows from the kind rather than being drawn independently,
    // so a record never claims to be a mobile served by a landline.
    lineType: kind === 'Mobile' ? 'Wireless'
            : kind === 'Landline' ? 'Landline'
            : r.pick(['Wireless', 'VoIP', 'Landline']),
    lastSeen: `${r.pick(['Jan','Mar','Apr','Jun','Aug','Sep','Nov'])} ${r.int(2019, CURRENT_YEAR)}`,
    src: r.pick(['telecom', 'telecom', 'panel', 'voter']),
    observed: r.int(2019, CURRENT_YEAR)
  };
}

function makeAddress(r, cityTuple, fromYear, toYear) {
  const [city, state] = cityTuple;
  const unit = r.chance(0.28)
    ? ` ${r.pick(UNIT_TYPE)} ${r.chance(0.5) ? r.int(1, 40) : r.pick('ABCDEFGH') + r.int(1, 12)}`
    : '';
  return {
    line1: `${r.int(100, 9899)} ${r.pick(STREETS)} ${r.pick(STREET_TYPE)}${unit}`,
    city, state,
    zip: pad(r.int(10000, 99999), 5),
    fromYear, toYear,
    type: r.pick(['Owned', 'Rented', 'Rented', 'Unknown']),
    src: r.pick(['assessor', 'deed', 'coa', 'utility', 'utility']),
    observed: toYear || CURRENT_YEAR
  };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function makeEmails(r, first, last, birthYear) {
  const f = slugify(first), l = slugify(last);
  const forms = [
    `${f}.${l}`, `${f}${l}`, `${f[0]}${l}`, `${f}${l}${birthYear % 100}`,
    `${f}_${l}`, `${l}.${f[0]}`, `${f}${r.int(11, 99)}`
  ];
  return r.sample(forms, r.int(1, 3)).map(u => ({
    address: `${u}@${r.pick(EMAIL_HOSTS)}`,
    status: r.pick(['Active', 'Active', 'Inactive', 'Unverified']),
    src: r.pick(['panel', 'panel', 'crawl']),
    observed: r.int(2018, CURRENT_YEAR)
  }));
}

function makeSocials(r, first, last) {
  const handle = r.pick([
    `${slugify(first)}.${slugify(last)}`,
    `${slugify(first)}${slugify(last)}`,
    `${slugify(first)[0]}${slugify(last)}${r.int(2, 89)}`
  ]);
  return r.sample(SOCIAL_NETS, r.int(0, 3)).map(s => ({
    network: s.net,
    url: s.pat(handle),
    lastActive: `${r.int(2021, CURRENT_YEAR)}`,
    src: 'crawl',
    observed: r.int(2021, CURRENT_YEAR)
  }));
}

function makeEmployment(r, age) {
  const workingYears = Math.max(0, age - 20);
  if (workingYears < 2) return [];
  const count = Math.min(3, 1 + Math.floor(workingYears / 9));
  const out = [];
  let year = CURRENT_YEAR;
  for (let i = 0; i < count; i++) {
    const span = r.int(2, 7);
    out.push({
      employer: r.pick(EMPLOYERS),
      title: r.pick(JOB_TITLES),
      fromYear: year - span,
      toYear: i === 0 ? null : year,   // null = listed as current
      src: r.pick(['profnet', 'profnet', 'bizreg', 'panel']),
      observed: i === 0 ? CURRENT_YEAR : year
    });
    year -= span + r.int(0, 2);
    if (year < CURRENT_YEAR - workingYears) break;
  }
  return out;
}

function makeEducation(r, age) {
  const out = [];
  if (age < 18) return out;
  const gradYear = CURRENT_YEAR - (age - 18);
  out.push({ school: r.pick(SCHOOLS), kind: 'High School', gradYear,
             src: 'alumni', observed: r.int(2015, CURRENT_YEAR) });
  if (r.chance(0.55)) {
    out.push({
      school: r.pick(COLLEGES),
      kind: r.pick(['Associate', 'Bachelor', 'Bachelor', 'Certificate']),
      gradYear: gradYear + r.int(2, 5),
      src: r.pick(['alumni', 'profnet']),
      observed: r.int(2015, CURRENT_YEAR)
    });
  }
  return out;
}

function makeVehicles(r, age) {
  if (age < 18 || !r.chance(0.6)) return [];
  return Array.from({ length: r.int(1, 2) }, () => {
    const [make, models] = r.pick(CAR_MAKES);
    return {
      year: r.int(2006, CURRENT_YEAR - 1),
      make, model: r.pick(models),
      color: r.pick(COLORS),
      plate: `${r.pick('ABCDEFGHJKLMNPRSTUVWXYZ')}${r.pick('ABCDEFGHJKLMNPRSTUVWXYZ')}${r.int(1, 9)}-${pad(r.int(0, 9999), 4)}`,
      src: 'dmv',
      observed: r.int(CURRENT_YEAR - 5, CURRENT_YEAR)
    };
  });
}

function makeLicenses(r, age) {
  if (age < 21 || !r.chance(0.3)) return [];
  return r.sample(LICENSES, r.int(1, 2)).map(name => ({
    name,
    status: r.pick(['Active', 'Active', 'Expired', 'Lapsed']),
    issuedYear: r.int(CURRENT_YEAR - 18, CURRENT_YEAR - 1),
    src: 'licboard',
    observed: r.int(CURRENT_YEAR - 3, CURRENT_YEAR)
  }));
}

// Civil/administrative filings only, and deliberately mundane. A synthetic
// people-search demo has no business inventing criminal histories for
// name/city combinations that real people plausibly share.
function makeCourtRecords(r, age) {
  if (age < 21 || !r.chance(0.22)) return [];
  return Array.from({ length: r.int(1, 2) }, () => ({
    type: r.pick(COURT_TYPES),
    caseNumber: `${r.int(19, 26)}-${r.pick(['CV', 'SC', 'TR', 'MC'])}-${pad(r.int(1, 99999), 5)}`,
    filedYear: r.int(CURRENT_YEAR - 15, CURRENT_YEAR - 1),
    disposition: r.pick(['Closed', 'Closed', 'Dismissed', 'Satisfied', 'Judgment entered']),
    src: 'docket',
    observed: r.int(CURRENT_YEAR - 5, CURRENT_YEAR)
  }));
}

function makeBusinesses(r, last, age) {
  if (age < 25 || !r.chance(0.14)) return [];
  return [{
    name: `${last} ${r.pick(['Contracting', 'Consulting', 'Property', 'Automotive', 'Catering', 'Design', 'Transport'])} ${r.pick(BIZ_SUFFIX)}`,
    role: r.pick(['Registered Agent', 'Member', 'Officer', 'Owner']),
    status: r.pick(['Active', 'Active', 'Dissolved', 'Inactive']),
    filedYear: r.int(CURRENT_YEAR - 20, CURRENT_YEAR - 2),
    src: 'bizreg',
    observed: r.int(CURRENT_YEAR - 4, CURRENT_YEAR)
  }];
}

function makeAliases(r, first, middle, last, gender) {
  const out = [];
  const nick = {
    James: 'Jim', Robert: 'Bob', Michael: 'Mike', William: 'Bill', Richard: 'Rick',
    Joseph: 'Joe', Thomas: 'Tom', Charles: 'Chuck', Daniel: 'Dan', Matthew: 'Matt',
    Anthony: 'Tony', Steven: 'Steve', Andrew: 'Andy', Kenneth: 'Ken', Timothy: 'Tim',
    Ronald: 'Ron', Edward: 'Ed', Jeffrey: 'Jeff', Nicholas: 'Nick', Jonathan: 'Jon',
    Stephen: 'Steve', Gregory: 'Greg', Alexander: 'Alex', Patrick: 'Pat', Benjamin: 'Ben',
    Patricia: 'Pat', Jennifer: 'Jen', Elizabeth: 'Liz', Barbara: 'Barb', Susan: 'Sue',
    Jessica: 'Jess', Katherine: 'Kate', Christine: 'Chris', Deborah: 'Debbie',
    Rebecca: 'Becky', Cynthia: 'Cindy', Kathleen: 'Kathy', Samantha: 'Sam',
    Victoria: 'Vicky', Margaret: 'Peggy', Stephanie: 'Steph', Michelle: 'Shelly'
  }[first];
  if (nick) out.push(`${nick} ${last}`);
  if (middle.length > 1 && r.chance(0.4)) out.push(`${first} ${middle} ${last}`);
  if (gender === 'F' && r.chance(0.35)) out.push(`${first} ${r.pick(LAST)}`); // former surname
  if (r.chance(0.15)) out.push(`${first[0]} ${last}`);
  return out;
}

/* ---------- population assembly ---------- */

export function buildPopulation(seed = 20260902, households = 850) {
  const r = rng(seed);
  const people = [];
  const byId = new Map();
  let n = 0;

  const newId = () => `p${pad(n++, 5)}`;

  function makePerson(spec) {
    const {
      first, middle, last, gender, age, homeCity, householdId
    } = spec;
    const id = newId();
    const birthYear = CURRENT_YEAR - age;
    const state = homeCity[1];
    const region = homeCity[2];

    // Address history walks backwards in time; earlier addresses may sit in
    // other cities, weighted toward the same region.
    const moves = age < 25 ? r.int(1, 2) : r.int(2, 5);
    const addresses = [];
    let toYear = null;                       // null = current residence
    let fromYear = CURRENT_YEAR - r.int(1, 8);
    for (let i = 0; i < moves; i++) {
      const city = i === 0
        ? homeCity
        : (r.chance(0.65)
            ? r.pick(CITIES.filter(c => c[2] === region))
            : r.pick(CITIES));
      if (fromYear <= birthYear + 16) { fromYear = birthYear + 16; }
      addresses.push(makeAddress(r, city, fromYear, toYear));
      if (fromYear <= birthYear + 16) break;
      toYear = fromYear;
      fromYear = toYear - r.int(2, 9);
    }

    const phones = [makePhone(r, state, 'Mobile')];
    if (r.chance(0.45)) phones.push(makePhone(r, state, r.pick(['Landline', 'Mobile', 'Work'])));
    if (r.chance(0.15)) phones.push(makePhone(r, state, 'Previous'));

    const person = {
      id, householdId,
      first, middle, last, gender,
      fullName: `${first} ${middle ? middle + ' ' : ''}${last}`.replace(/\s+/g, ' '),
      displayName: `${first} ${last}`,
      age, birthYear,
      birthMonth: r.pick(['January','February','March','April','May','June','July',
                          'August','September','October','November','December']),
      city: homeCity[0], state, region,
      aliases: makeAliases(r, first, middle, last, gender),
      phones,
      emails: makeEmails(r, first, last, birthYear),
      addresses,
      socials: makeSocials(r, first, last),
      employment: makeEmployment(r, age),
      education: makeEducation(r, age),
      vehicles: makeVehicles(r, age),
      licenses: makeLicenses(r, age),
      courtRecords: makeCourtRecords(r, age),
      businesses: makeBusinesses(r, last, age),
      relatives: [],
      associates: [],
      confidence: r.int(62, 98),
      lastUpdated: `${r.pick(['Feb','Apr','May','Jul','Aug'])} ${r.int(2025, CURRENT_YEAR)}`,
      // Which feed established the core identity fields (legal name, DOB).
      identitySrc: r.pick(['voter', 'voter', 'assessor', 'coa']),
      identityObserved: r.int(2020, CURRENT_YEAR)
    };
    people.push(person);
    byId.set(id, person);
    return person;
  }

  // --- households: a surname anchored to a city, with linked kin ---
  for (let h = 0; h < households; h++) {
    const hid = `h${pad(h, 5)}`;
    const last = r.pick(LAST);
    const city = r.pick(CITIES);
    const members = [];

    const headGender = r.chance(0.5) ? 'M' : 'F';
    const headAge = r.int(28, 78);
    const head = makePerson({
      first: r.pick(headGender === 'M' ? FIRST_M : FIRST_F),
      middle: r.chance(0.7) ? r.pick(MIDDLE) : '',
      last, gender: headGender, age: headAge, homeCity: city, householdId: hid
    });
    members.push(head);

    // partner
    if (r.chance(0.68)) {
      const pg = headGender === 'M' ? 'F' : 'M';
      const partner = makePerson({
        first: r.pick(pg === 'M' ? FIRST_M : FIRST_F),
        middle: r.chance(0.6) ? r.pick(MIDDLE) : '',
        last: r.chance(0.8) ? last : r.pick(LAST),
        gender: pg,
        age: Math.max(24, headAge + r.int(-7, 7)),
        homeCity: city, householdId: hid
      });
      members.push(partner);
      const spouseRel = r.chance(0.85) ? 'Spouse' : 'Possible spouse';
      const spouseSrc = r.pick(['hhold', 'hhold', 'assessor', 'obit']);
      head.relatives.push({ id: partner.id, relation: spouseRel, src: spouseSrc });
      partner.relatives.push({ id: head.id, relation: spouseRel, src: spouseSrc });
    }

    // children — old enough to hold their own records
    if (headAge >= 42) {
      const kids = r.int(0, 3);
      for (let k = 0; k < kids; k++) {
        const kg = r.chance(0.5) ? 'M' : 'F';
        const kidAge = r.int(18, Math.max(19, headAge - 22));
        // Adult children have often moved away.
        const kidCity = r.chance(0.45)
          ? r.pick(CITIES.filter(c => c[2] === city[2]))
          : city;
        const kid = makePerson({
          first: r.pick(kg === 'M' ? FIRST_M : FIRST_F),
          middle: r.chance(0.7) ? r.pick(MIDDLE) : '',
          last, gender: kg, age: kidAge, homeCity: kidCity, householdId: hid
        });
        members.push(kid);
        for (const parent of members.slice(0, 2)) {
          if (parent === kid) continue;
          const kinSrc = r.pick(['hhold', 'hhold', 'obit']);
          parent.relatives.push({ id: kid.id, relation: 'Child', src: kinSrc });
          kid.relatives.push({ id: parent.id, relation: 'Parent', src: kinSrc });
        }
      }
      // siblings link to each other
      const sibs = members.filter(m => m.age <= headAge - 22);
      for (const a of sibs) for (const b of sibs) {
        if (a !== b) a.relatives.push({ id: b.id, relation: 'Sibling', src: r.pick(['hhold', 'obit']) });
      }
    }
  }

  // --- cross-household associates: same city, overlapping era ---
  const byCity = new Map();
  for (const p of people) {
    const key = `${p.city}|${p.state}`;
    if (!byCity.has(key)) byCity.set(key, []);
    byCity.get(key).push(p);
  }
  for (const group of byCity.values()) {
    for (const p of group) {
      const pool = group.filter(q => q.householdId !== p.householdId);
      if (!pool.length) continue;
      for (const q of r.sample(pool, Math.min(pool.length, r.int(0, 3)))) {
        const basis = r.pick(['Shared address history', 'Shared phone record',
                              'Possible co-worker', 'Neighbor record']);
        p.associates.push({
          id: q.id,
          basis,
          src: { 'Shared address history': 'utility', 'Shared phone record': 'telecom',
                 'Possible co-worker': 'profnet', 'Neighbor record': 'assessor' }[basis]
        });
      }
    }
  }

  // De-duplicate link lists (a person can be captured twice by the sibling pass).
  for (const p of people) {
    const seen = new Set();
    p.relatives = p.relatives.filter(x => !seen.has(x.id) && seen.add(x.id) && x.id !== p.id);
    const seen2 = new Set();
    p.associates = p.associates.filter(x => !seen2.has(x.id) && seen2.add(x.id) && x.id !== p.id);
  }

  return { people, byId };
}
