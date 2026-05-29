---
name: custom-keyboard-system
description: >-
  Architecture and coding conventions for the Custom Keyboard System repo — a
  Next.js 16 (App Router) + React 19 + MongoDB/Mongoose e-commerce app with a
  custom keyboard builder. Apply when creating or modifying anything in this
  codebase: API routes, auth/session, OTP/email, Mongoose models, payment,
  image upload, or cart. Encodes the API-response shape, security rules, OTP
  rules, and build gotchas so changes stay consistent with the existing system.
---

# Custom Keyboard System — Conventions

Project-specific rules for this repo. The full reference lives in `skill.md` at
the repo root — read it for deeper context. This skill is the enforceable
summary; follow it on every change.

## Stack (don't reintroduce removed deps)

Next.js 16 (App Router, Turbopack, `output: standalone`) · React 19 · TypeScript
`strict` · Tailwind CSS (Indigo/Slate theme) · MongoDB/Mongoose · bcryptjs ·
Nodemailer (Gmail SMTP) · Cloudinary · Sonner · Recharts · lucide-react.

There is **no Bootstrap** and **no Redux/Zustand** — use Tailwind and the two
React Contexts (`AuthContext`, `CartContext`). Path alias is `@/*` → repo root.

## API routes

- Call `await dbConnect()` (`@/lib/mongodb`) before any DB access.
- Respond in the standard shape: `{ success: boolean, data?, error?, message? }`.
  - Success: `NextResponse.json({ success: true, data: result })`
  - Error: `NextResponse.json({ success: false, error: "..." }, { status })`
  - Put any extra payload under `data`.
- `requireAuth()` for logged-in endpoints; `requireAdmin()` for back-office
  (product/category/custom-part/user/shipping/upload). Helpers in `@/lib/auth`.
- Never trust `userId`/`role`/owner identity from the request body — derive from
  the session. Reuse ownership logic in `@/lib/order-access.ts`.

## Auth & session

- Signed `httpOnly` session cookie named `session` (`sameSite=lax`, `secure` in
  prod). Set/clear via `setSessionCookie` / `clearSessionCookie`.
- `AuthContext` exposes `{ user, isLoading, login, register, verifyOTP, logout,
  isAuthenticated }`; `user` comes from `/api/auth/me`. Never store auth state in
  `localStorage`. Client `role` is for UI only — enforce on the server.
- forgot-password / reset-password pages call the API directly via `fetch` (not
  through AuthContext).

## OTP & email (`models/OTP.ts`, `lib/email.ts`)

- OTP doc fields: `email, otp, purpose ("verify"|"reset"), attempts, createdAt`
  (TTL 5 min via `expires: 300`). Always scope queries by `purpose` — verify and
  reset codes must not be interchangeable.
- Brute-force guard: max `MAX_OTP_ATTEMPTS` (5) wrong tries per code. Verify by
  `findOne({ email, purpose })` then compare `otp` and increment `attempts` — do
  NOT query by `otp` directly (you can't count failures that way). On limit,
  keep the record (don't delete) and return HTTP 429.
- Resend cooldown: `OTP_RESEND_COOLDOWN_SECONDS` (60). Check the latest OTP's
  `createdAt`; return 429 with `retryAfter` if too soon.
- Email sends through `lib/email.ts`. `isEmailConfigured` is true when both
  `EMAIL_USER` and `EMAIL_PASS` are set.
  - **Gate `devOtp` with `isEmailConfigured`** — only return the OTP in the API
    response when email is NOT configured (demo mode). Leaking it when real email
    is on defeats verification.
  - `sendOTPEmail(to, otp, purpose)` and `sendShippingEmail(...)` share the
    branded `emailShell()` layout. Reuse it for new emails.

## Mongoose models

- Guard against hot-reload (`mongoose.models.X || mongoose.model(...)`),
  `timestamps: true`, `.lean()` for read-only queries.

## Payment (demo mode)

- Payment is mocked — `/api/payment/create-charge` simulates success and sets the
  order to `paid`/`processing`. Keep owner/admin checks even in demo. Don't wire a
  real gateway unless asked.

## Build / deploy gotchas

- A Server Component page that reads MongoDB at render (e.g. `app/custom/page.tsx`)
  must `export const dynamic = "force-dynamic"`, otherwise `next build` tries to
  prerender it and fails when the build machine can't reach the DB.
- MongoDB Atlas needs `0.0.0.0/0` in Network Access for serverless/Vercel.
- On production, always set `EMAIL_USER`/`EMAIL_PASS` (else demo mode leaks
  `devOtp`). Required env: `MONGODB_URI`, `SESSION_SECRET`, `CLOUDINARY_*`.

## Misc

- Seed routes (`/api/seed`, `/api/custom-parts/seed`) return 403 in production —
  keep that guard.
- `/api/upload` is admin-only, image files ≤ 5MB → Cloudinary `secure_url`.
- Use `next/navigation` `useRouter`, `next/link` `Link`, and Sonner for toasts.
- Prefer `<Image />` on storefront pages; avoid `any`.
