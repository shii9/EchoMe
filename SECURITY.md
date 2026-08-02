# EchoMe security readiness

## What is protected in this repository

- The client no longer contains an admin username/password or trusts a browser
  `localStorage` flag as authentication. The blog admin panel and article
  creation UI have been removed from the client.
- Browser API-key persistence is disabled. Provider keys must be stored in a
  server-side secret manager and used through authenticated backend endpoints.
- The Supabase AI function validates request size, message roles and lengths,
  restricts CORS origins, rejects unsupported methods, adds security headers,
  avoids returning internal error details, and applies an in-memory request
  limit.
- The analyzer and AI assistant reject oversized inputs, and the service worker
  only handles same-origin `GET` requests.
- The Vite development server listens on localhost instead of every network
  interface.

## Required production configuration

This application is primarily a browser client. Client-side checks cannot
protect an admin account, API provider credentials, user-generated blog data,
or a globally enforceable quota. Before deploying those features:

1. Add Supabase Auth (or another server-side identity provider) for admin users.
2. Add database tables and Row Level Security policies for posts, comments,
   loves, and reports. Do not use localStorage as the source of truth for
   moderation or authorization.
3. Move all provider calls and secrets to authenticated Edge Functions or an
   API server. `VITE_*` values are public after the frontend is built.
4. Set `ALLOWED_ORIGINS` on the `phishing-ai-chat` function to the exact HTTPS
   origins that should call it. Do not use `*` in production.
5. Add a provider/gateway rate limit keyed by authenticated user and IP. The
   function's in-memory limiter is a local safety net and is not a replacement
   for a distributed production quota.
6. Configure hosting headers: HTTPS/HSTS, Content-Security-Policy with only
   required origins, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
   `Permissions-Policy`, and clickjacking protection (`frame-ancestors` or
   `X-Frame-Options`).
7. Rotate any credentials that may have been used before this hardening pass.

## Verification commands

```bash
npm ci
npm audit --omit=dev
npm run lint
npm run test:phishing
npm run build
```

The current audit may still report the React Router package's RSC-only code
path advisory. EchoMe uses a client-side `BrowserRouter`, not React Server
Components or server actions. Still review the audit output after every
dependency update and keep the lockfile committed.
