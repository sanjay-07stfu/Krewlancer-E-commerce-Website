# Production Checklist (Node + Mongo)

## Security

- `NODE_ENV=production`
- Strong `SESSION_SECRET`
- Strong CORS allowlist in `ALLOWED_ORIGINS`
- HTTPS enabled for frontend and backend
- Secure Razorpay keys and webhook secret

## Infrastructure

- MongoDB backups enabled
- Backend process manager configured (PM2/systemd/container)
- Reverse proxy configured for `/api/*`
- Logs and monitoring enabled

## Functional Validation

- Auth session flow works with cookies
- Product/catalog/cart/checkout flows work
- Razorpay payment verification works
- Admin panel access is restricted
- Email notifications send successfully

## Performance

- Frontend build succeeds
- Backend starts without warnings
- Compression and caching enabled at proxy/CDN
