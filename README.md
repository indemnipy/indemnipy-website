# indemnipy

The landing page for **indemnipy** — a cooperative of open source developers intending to build Python packages for the insurance industry.

> This repo contains **only the coming-soon website**. Individual Python packages, once we start publishing, will live in their own repos under this organisation.

---

## Stack

- Plain HTML / CSS / JS — no build step, no framework
- [Cloudflare Pages](https://pages.cloudflare.com) for hosting
- [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the edge) for the waitlist
- A single [Pages Function](https://developers.cloudflare.com/pages/functions/) at `/api/subscribe` that writes signups to D1

## Structure

```
.
├── index.html                 # the page itself
├── wrangler.toml              # Cloudflare project + D1 binding config
├── package.json               # wrangler + convenience scripts
├── functions/
│   └── api/
│       └── subscribe.js       # POST /api/subscribe → writes to D1
└── migrations/
    └── 0001_initial.sql       # waitlist table schema
```

## Running locally

Requires Node.js 18 or newer.

```bash
# install wrangler
npm install

# one-time Cloudflare auth (opens a browser)
npx wrangler login

# create the D1 database (prints a database_id — paste into wrangler.toml)
npm run db:create

# apply migrations to your local D1
npm run db:migrate:local

# serve the site at http://localhost:8788
npm run dev
```

Submit the signup form locally and it writes to a local SQLite file that wrangler manages under `.wrangler/`.

## Deploying

The first time:

```bash
# apply migrations to production D1
npm run db:migrate

# deploy
npm run deploy
```

For ongoing development, the recommended path is to connect this repo to Cloudflare Pages via Git (Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git). After that, every push to `main` deploys automatically. You'll need to add the D1 binding once in the dashboard under **Settings → Bindings** (variable name `DB`, database `indemnipy`).

## Managing the waitlist

```bash
npm run db:count      # total subscribers
npm run db:list       # all entries, newest first
```

For anything more elaborate — CSV export, filtering by country, etc. — use wrangler directly:

```bash
npx wrangler d1 execute indemnipy --remote --json \
  --command "SELECT email FROM subscribers ORDER BY created_at;" \
  | jq -r '.[0].results[].email' > subscribers.csv
```

## Schema changes

Never edit an applied migration. To change the schema, create a new one:

```bash
npx wrangler d1 migrations create indemnipy describe_your_change
# edit the generated file in migrations/
npm run db:migrate:local   # test
npm run db:migrate         # ship
```

## Contributing

Issues and PRs welcome. The site is intentionally minimal while the project is pre-launch — please keep changes small and in the existing editorial style.

If you're interested in joining the cooperative proper (contributing to the Python packages themselves, once that begins) rather than just the website, open a GitHub discussion and introduce yourself.

## Licence

This repository is released under the **[MIT Licence](./LICENSE)**.
