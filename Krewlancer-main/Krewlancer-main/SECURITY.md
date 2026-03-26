# Security Notes (Node Backend)

## Current Controls

- Password hashing for user credentials
- Session-based auth with HTTP-only cookies
- CORS allowlist + credentials support
- Helmet headers enabled
- Input validation in controllers

## Required Production Settings

- Set `NODE_ENV=production`
- Use strong `SESSION_SECRET`
- Use HTTPS for all origins
- Configure strict `ALLOWED_ORIGINS`
- Rotate Razorpay and mail credentials regularly

## Operational Practices

- Keep dependencies updated
- Monitor logs for auth and payment errors
- Back up MongoDB regularly
- Restrict admin accounts and audit access
