# Quick Start (Node Backend)

## Prerequisites

- Node.js 20+
- MongoDB

## Install

```bash
npm install
npm --prefix backend install
```

## Configure

1. Copy environment file:

```bash
cp .env.example .env
```

2. Update required variables in `.env`:
- `SESSION_SECRET`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `ALLOWED_ORIGINS`
- `VITE_API_BASE`
- `VITE_RAZORPAY_KEY_ID`

## Run

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev:backend
```

Seed data:

```bash
npm run seed:backend
```

## Verify

- Open frontend URL and sign in.
- Confirm backend health responds at `/api/health`.
- Add product to cart and place a test order.
