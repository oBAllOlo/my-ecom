# my-ecom

E-commerce web application for custom keyboards, built with Next.js, TypeScript, MongoDB, and Omise.

## Repository Layout

This repository uses a nested app directory:

```text
.
├── .vscode/
├── my-ecom/          # Main Next.js application
└── .gitattributes
```

The main project files live in [`my-ecom/`](D:/my-ecom/my-ecom/my-ecom).

## App Features

- User registration, login, logout, and OTP verification
- Session-based authentication with `httpOnly` cookies
- Product catalog, product detail, and reviews
- Shopping cart and checkout
- Custom keyboard builder
- Order history, tracking, and delivery confirmation
- Omise payment integration
- Admin dashboard for products, categories, users, orders, and custom parts

## Quick Start

```bash
cd my-ecom
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

Run these inside `my-ecom/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Environment Variables

Create `my-ecom/.env.local` and configure at least:

```env
MONGODB_URI=
SESSION_SECRET=
CRON_SECRET=
OMISE_SECRET_KEY=
NEXT_PUBLIC_OMISE_PUBLIC_KEY=
```

## Documentation

- App README: [my-ecom/README.md](D:/my-ecom/my-ecom/my-ecom/README.md)
- Internal development guide: [my-ecom/skill.md](D:/my-ecom/my-ecom/my-ecom/skill.md)

---

Updated: May 9, 2026
