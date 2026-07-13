---
name: next16-conventions
description: Next.js 16 breaking changes and conventions that differ from older versions (14/15) — async request APIs, middleware→proxy, Turbopack defaults, next/image config, caching APIs, removed features. Use before writing or reviewing any App Router code, config, or route handler in this project — training data defaults to pre-16 Next.js behavior, which is wrong here.
---

# Next.js 16 conventions (this project uses 16.2.10)

Your training data's default assumptions about Next.js are almost certainly for an older version. This project is on **Next.js 16.2.10 / React 19.2**. The points below are the ones most likely to cause you to write wrong or deprecated code. For anything not covered here, read the full doc at `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (and `version-15.md` for context on what became permanent in 16) before writing code — per `AGENTS.md`.

## Async Request APIs — fully required, no sync fallback

`cookies()`, `headers()`, `draftMode()`, and `params`/`searchParams` in `page.js`/`layout.js`/`route.js`/`default.js`/image-metadata files are **Promises**. Synchronous access (which 15 allowed as a deprecated fallback) is **removed** in 16 — it will error, not just warn.

```ts
// route.ts / page.tsx / layout.tsx
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

This project already does this correctly (e.g. `app/api/admin/bookings/[id]/route.ts`) — keep new dynamic routes consistent with that pattern. Same rule applies to `opengraph-image`/`twitter-image`/`icon`/`apple-icon` generator functions (`params` and `id` are Promises there too; `generateImageMetadata` itself stays sync) and to the `id` param in `sitemap.ts`.

## `middleware` → `proxy`

The `middleware.ts` filename and `middleware` export are deprecated in favor of `proxy.ts` / `export function proxy(request)`. `proxy` only runs on the `nodejs` runtime (no `edge` option). This project has no middleware/proxy file currently — if one is added, name it `proxy.ts` from the start, not `middleware.ts`.

## Turbopack is the default — don't add `--turbopack` flags

`next dev` and `next build` use Turbopack by default now; the old `--turbopack` flag is a no-op leftover from 15. This project's `package.json` scripts are already correct (`"dev": "next dev"`, `"build": "next build"`, no flags). If a custom `webpack` config is ever needed, `next build` will **fail fast** rather than silently ignore it — use `--webpack` to opt out deliberately, or migrate to `turbopack` config (top-level `turbopack` key in `next.config.ts`, not `experimental.turbopack`).

## `next lint` is gone

There is no `next lint` command anymore. This project already calls ESLint directly (`"lint": "eslint"` in `package.json`, flat config at `eslint.config.mjs`). Never suggest `next lint` or an `eslint: {}` block in `next.config.ts` — that option was removed.

## `next/image` config defaults changed

- `images.minimumCacheTTL` default is now **4 hours** (was 60s) — don't assume aggressive revalidation.
- `images.qualities` defaults to **`[75]` only** — a `quality` prop outside the configured array gets coerced to the nearest allowed value, it doesn't error.
- `images.imageSizes` no longer includes `16` by default.
- Local image `src` with a query string (`/assets/photo?v=1`) now requires `images.localPatterns[].search` to be configured, or it's blocked (anti-enumeration protection).
- `images.domains` is deprecated — use `images.remotePatterns` instead.
- `next/legacy/image` is deprecated — always use `next/image`.

## Caching APIs

- `revalidateTag(tag)` alone is deprecated — it now requires a second `cacheLife` profile argument: `revalidateTag('posts', 'max')`.
- New: `updateTag(tag)` (Server Actions only) for read-your-writes semantics — expires and refreshes in the same request, use it instead of `revalidateTag` when the user needs to see their own change immediately.
- New: `refresh()` from `next/cache` to refresh the client router from a Server Action without a full revalidation.
- `cacheLife`/`cacheTag` are stable now — import as `cacheLife`/`cacheTag` from `next/cache`, not `unstable_cacheLife`/`unstable_cacheTag`.
- `experimental.dynamicIO` / `experimental.useCache` are deprecated in favor of the top-level `cacheComponents: true` config option. PPR's `experimental_ppr` segment config is also removed in favor of `cacheComponents`.

## Parallel routes require `default.js`

Every parallel-route slot (`app/@slot/...`) needs an explicit `default.js` (calling `notFound()` or returning `null`) — the build now fails without one. N/A currently (this project has no parallel routes), but if you add one, don't skip it.

## Removed entirely — never suggest these

- **AMP**: `next/amp`, `useAmp`, `export const config = { amp: true }`, `amp` config key — all gone.
- **`serverRuntimeConfig` / `publicRuntimeConfig`** — removed. Use `process.env.X` directly in Server Components for server-only values, `NEXT_PUBLIC_X` for client-exposed ones (this project already follows this — see `.env.local` naming).
- **`unstable_rootParams`** — removed with no replacement yet.
- `devIndicators.appIsrStatus` / `buildActivity` / `buildActivityPosition` — removed options (indicator itself still exists).

## Runtime requirements

Node.js 20.9+ required (18 unsupported), TypeScript 5.1+ required. Not likely to bite in this project but worth knowing if a deploy target's Node version is ever in question.

## Minor behavioral changes worth knowing

- Next no longer forces `scroll-behavior: auto` during navigation by default. If this project ever sets `scroll-behavior: smooth` globally and wants Next's old "instant scroll on nav" behavior back, add `data-scroll-behavior="smooth"` to the `<html>` element.
- `next build` output no longer prints `size`/`First Load JS` metrics (deemed inaccurate for RSC apps) — don't reference those numbers from a build log as if they still appear.
- `next dev` no longer loads `next.config` when just starting the CLI wrapper, only when the server actually boots — a config file checking `process.argv.includes('dev')` will get `false` now; check `NODE_ENV === 'development'` instead if you ever need that.
