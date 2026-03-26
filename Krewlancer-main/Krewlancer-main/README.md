# krewlancer

Full-stack ecommerce project with:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Payments: Razorpay (test mode)

## Backend stack

The backend lives in backend and is structured as:
- backend/src/routes
- backend/src/controllers
- backend/src/models
- backend/src/middleware
- backend/src/services
- backend/src/config

Implemented API domains:
- Auth: signup, login, session user, profile update, logout, password change, Google auth compatibility routes
- Uploads: product image and profile image uploads
- Products: list/detail/create/update/delete
- Categories: list/create/delete/subcategory-delete
- Cart: list/add
- Wishlist: list/add/remove
- Reviews: list/add
- Payments: create order, create QR, verify signature, webhook, admin payments/refunds, QR status check
- Orders: create/list/admin list/admin detail/status update/dispatch/webhooks
- Admin: homepage config, analysis, customers, customer profile/block-unblock

## Prerequisites

- Node.js 20+
- MongoDB running locally or remotely

## Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
npm --prefix backend install
```

3. Create environment file from example:

```bash
cp .env.example .env
```

4. Set required env values:

```env
SESSION_SECRET=change-this
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=lkrewlancer
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
VITE_API_BASE=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

## Run

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev:backend
```

Seed admin user and base categories:

```bash
npm run seed:backend
```

Default seeded admin:
- email: admin@123.com
- password: admin123

## Notes on compatibility

- Backend uses session-based auth and HTTP-only cookies to match current frontend fetch calls with credentials: include.
- API paths remain under /api/* and response keys are aligned with the existing frontend usage.
- Product flags include both camelCase and snake_case fields where existing UI expects legacy names.

## Security and production

- Uses Helmet, CORS allowlist, session store in MongoDB, and hashed passwords.
- For production, set NODE_ENV=production and secure cookie-compatible HTTPS origins.
- Rotate SESSION_SECRET and Razorpay keys before production deployment.
