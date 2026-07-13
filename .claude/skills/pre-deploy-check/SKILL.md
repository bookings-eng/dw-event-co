---
name: pre-deploy-check
description: Run lint, typecheck, Stripe webhook config verification, and a .env.local staging check before pushing to main or deploying dw-event-co. Use before every push to main or production deploy.
---

# Pre-deploy check

Run this checklist before pushing to `main` or deploying. Run every step even if an earlier one fails, then report a single ✅/❌ summary at the end — don't stop early, the user needs the full picture.

## 1. Lint

```
node node_modules/eslint/bin/eslint.js .
```

Report any errors/warnings. Errors are blocking; warnings are not.

## 2. Typecheck

```
node node_modules/typescript/bin/tsc --noEmit --incremental
```

Report any TS errors. Any error is blocking.

## 3. Stripe webhook config

```
node .claude/skills/pre-deploy-check/verify-webhook-env.mjs
```

This checks `.env.local` has well-formed `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and that `app/api/webhooks/stripe/route.ts` still verifies signatures with `STRIPE_WEBHOOK_SECRET`. It never prints the secret values, only pass/fail and test/live mode.

If this is a real deploy (not just a push), also remind the user: the **production** hosting provider's env vars and the Stripe Dashboard's live webhook endpoint secret must match each other — this script only checks the local `.env.local` file and cannot verify production config.

## 4. .env.local not staged

```
git status --porcelain -- .env.local
git diff --cached --name-only
```

Fail this step if `.env.local` appears in either output. As a backstop, also check the staged diff for obvious leaked-secret patterns:

```
git diff --cached | grep -E "sk_live_|whsec_|SUPABASE_SERVICE_ROLE_KEY|-----BEGIN"
```

Any match is a blocking failure — investigate before letting the user push.

## Output

End with a checklist like:

```
✅ Lint
✅ Typecheck
✅ Stripe webhook config
✅ .env.local not staged
```

or list what failed and why. Only tell the user it's safe to push to main if all four steps pass.
