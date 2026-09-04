# Traceline

> **None of the people in this project are real.** Traceline looks like a
> people-search site, but it never looks anything up. All ~2,400 profiles —
> names, faces, addresses, phone numbers, relatives, employers, court filings
> and the "sources" that assert them — are invented by a seeded random number
> generator running in the browser. There is no database, no backend and no
> network call. Searching a real person's name here returns a fictional
> character who happens to share it, and nothing about that character describes
> the real person.

A front-end study of the people-search / background-report genre, built on
**entirely synthetic data**. No scraping, no data-broker feeds, no backend, no
network calls — the whole dataset is generated in the browser at page load.

## What it is

Traceline reproduces the *shape* of a people-search product — search, progress
theatre, ranked results with the name-collision problem on display, and a tabbed
report — so the interface patterns can be studied without building the data
pipeline that makes the real thing consequential.

Every report shows every field it holds, and every field is labelled with the
(fictional) feed that asserted it.

## What it deliberately is not

- **No real data.** ~2,400 profiles are procedurally generated from a fixed
  seed. Nothing is scraped, purchased, or matched against a real identity.
- **No criminal history.** The generator produces civil and administrative
  filings only. Criminal records are where a bad identity match does the most
  harm to a real person.
- **No paywall.** Nothing is gated. `#/pricing` documents the genre's usual
  pricing ladder as a design artifact; it takes no payment details and has no
  checkout.
- **No SSNs, credit data, or exact dates of birth.** Birth month and year only.

## Running it

Any static server; ES modules need HTTP rather than `file://`.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## How the data is built

`js/generator.js` seeds a mulberry32 PRNG and builds 850 households. Each gets a
surname and home city, one or two adults, sometimes adult children; the
generator then links spouses, parents, children and siblings, and adds
cross-household associates drawn from the same city. Address histories walk
backwards in time weighted toward staying in one region, which is what makes the
profiles read as plausible rather than random.

Because the seed is fixed, the dataset is byte-identical on every load — which
is what lets a URL like `#/report/p01939` stay valid without a server.

Every generated record carries a `src` (a fictional feed from `js/pools.js`) and
an `observed` year. `provenanceRows()` in `js/report.js` flattens a profile into
field-level provenance, and the Sources tab rolls that up per feed.

## Layout

```
index.html          shell
css/styles.css      light + dark, system-preference aware
js/pools.js         name/place/employer word pools, source catalog
js/generator.js     seeded population builder
js/search.js        query scoring and index
js/ui.js            escaping, chrome, provenance tags
js/views.js         landing, results, pricing, about
js/report.js        report tabs incl. provenance
js/app.js           hash router and boot
```

Vanilla HTML/CSS/ES modules. No dependencies, no build step.

## A note on the real thing

The front end is the easy half. A real product in this category is regulated
infrastructure: the FCRA governs how such reports may be used for employment,
housing and credit decisions; several states require data brokers to register
and honour deletion requests; and every upstream source carries its own terms.
The engineering problem that actually matters is entity resolution — deciding
when two records describe the same person — and getting it wrong attaches
someone else's history to a real human's name.

That's why this demo stops where it does.
