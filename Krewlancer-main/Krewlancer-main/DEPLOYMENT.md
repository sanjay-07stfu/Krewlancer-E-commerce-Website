# Deployment Guide (Node.js + Express + MongoDB)

This project is deployed as:
- Frontend: React + Vite static build
- Backend: Node.js + Express (folder: backend)
- Database: MongoDB

## Environment Variables

Set these on your backend host:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=replace-with-strong-random-value
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=lkrewlancer
BACKEND_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-mail-password
MAIL_DEFAULT_SENDER=your-email@example.com
BORZO_API_TOKEN=optional-token
```

Set these on your frontend host:

```env
VITE_API_BASE=https://api.your-domain.com
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

## Build And Run

1. Install dependencies:

```bash
npm install
npm --prefix backend install
```

2. Build frontend:

```bash
npm run build
```

3. Start backend:

```bash
npm run start:backend
```

## Reverse Proxy

Use Nginx or a managed platform to route:
- `/api/*` -> backend server
- static frontend assets -> built frontend output

## Post-Deploy Checks

- Login/signup works with cookies enabled.
- `/api/products`, `/api/cart`, `/api/orders` return expected payloads.
- Razorpay order creation and signature verification work.
- Admin routes require admin session.
- CORS credentials work from deployed frontend origin.
