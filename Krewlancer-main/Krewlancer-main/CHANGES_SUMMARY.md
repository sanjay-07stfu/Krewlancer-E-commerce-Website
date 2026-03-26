# Changes Summary

## Migration Changes

- Replaced backend runtime with Node.js + Express.
- Introduced MongoDB/Mongoose data layer.
- Preserved frontend endpoint contract under `/api/*`.
- Added backend scripts to root `package.json`:
  - `dev:backend`
  - `start:backend`
  - `seed:backend`
- Removed legacy backend artifacts from root and archived them.

## Active Runtime

- Frontend: Vite (`npm run dev`)
- Backend: Express (`npm run dev:backend`)
