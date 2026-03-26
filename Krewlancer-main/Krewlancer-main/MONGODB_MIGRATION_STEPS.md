# MongoDB Migration Notes

This project now runs on MongoDB as the active backend database.

## Current State

- Express controllers use Mongoose models in `backend/src/models`.
- Session storage is persisted in MongoDB.
- Core domains migrated: users, products, categories, cart, wishlist, orders, payments.

## Verification Checklist

- Backend starts and connects to MongoDB.
- User auth and session persistence works.
- Cart/order/payment flow works end-to-end.
- Admin reports and order management endpoints work.
