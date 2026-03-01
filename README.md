# Project

Next.js (v16) TypeScript web app with Firebase, NextAuth, and Razorpay integration.

## Tech stack

- Next.js 16 + React 19
- TypeScript
- Firebase (client + admin)
- NextAuth for authentication
- Razorpay for payments
- Tailwind CSS

## Quick start

Prerequisites

- Node.js 18+ (recommended)
- npm or pnpm

Install

```bash
npm install
```

Development

```bash
npm run dev
# Open http://localhost:3000
```

Build

```bash
npm run build
npm run start
```

Lint

```bash
npm run lint
```

Run a TypeScript script (examples in `scripts/` or `tests/`)

```bash
npx tsx tests/verify-razorpay-logic.ts
```

## Environment variables

The app uses several environment variables. Provide these in a `.env.local` (or via your hosting provider):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server / admin-side (private):

- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string) OR the trio below:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (newline characters must be escaped as `\n` when set in the env)
- `AUTH_SECRET` (NextAuth secret)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (client key)
- Razorpay secret key should be kept server-side (used in API routes)

Notes

- If using `FIREBASE_SERVICE_ACCOUNT_KEY`, set it to the JSON string of the service account. The code already handles either approach.
- `NEXT_PUBLIC_` prefixed vars are safe to expose to the browser; others must remain secret.

## Useful folders & files

- `src/app` — Next.js app routes and pages
- `src/lib/firebase.ts` — client Firebase init
- `src/lib/firebase-admin.ts` — admin Firebase init
- `src/lib/auth.ts` — NextAuth configuration
- `src/hooks/useRazorpay.ts` — Razorpay client hook
- `scripts/` — utilities and seed scripts (e.g., `seed-shop.ts`)
- `tests/verify-razorpay-logic.ts` — example test/script

## Deployment

- Host on Vercel (recommended) or other Node-compatible host.
- Set the same environment variables in your host dashboard.
- Build step: `npm run build` then `npm start` (or let the host run the build/start as configured).

## Local development tips

- Use `npx dotenv -e .env.local -- npm run dev` if you want to load env vars from a local file for certain CLI invocations.
- For Firebase admin local testing, prefer `FIREBASE_SERVICE_ACCOUNT_KEY` or set the three admin env vars.

## Contributing

- Open issues or PRs for improvements.

## License

- Add a license file if desired.
