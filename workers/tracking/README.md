# i18nShaman Tracking Worker

Cloudflare Worker provider for alpha product events. The frontend sends events only to the i18nShaman API; the API forwards sanitized events to this worker.

## What It Stores

The worker accepts only whitelisted alpha tracking events and drops unsafe property keys/values. It does not receive translation text, key names, project names, search queries, email addresses, passwords, or tokens.

Events are written to:

- Cloudflare Workers Observability as structured logs with `event: "product_event"`.
- Workers Analytics Engine dataset `i18nshaman_product_events`.

## Deploy

```sh
npm install
npm run tracking:deploy
```

After deploy, set the API production env vars:

```env
TRACKING_PROVIDER_URL=https://<tracking-worker-host>/track
TRACKING_PROVIDER_SECRET=<shared-secret>
```

Set the same secret on the worker:

```sh
npx wrangler secret put TRACKING_PROVIDER_SECRET --config workers/tracking/wrangler.jsonc
```

The frontend should only use `VITE_API_URL`; it does not need a tracking provider URL.

## Dashboard

For live events:

1. Cloudflare Dashboard -> Workers & Pages.
2. Open `i18nshaman-tracking`.
3. Open Observability.
4. Filter logs by `product_event` or `productEvent`.

For aggregates, query Analytics Engine dataset `i18nshaman_product_events`.
