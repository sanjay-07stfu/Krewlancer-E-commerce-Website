import { ApiError } from "../utils/apiError.js";
import { resolveAuth } from "../utils/auth.js";

export function requireAuth(req, res, next) {
  const auth = resolveAuth(req);
  if (!auth?.userId) {
    return next(new ApiError(401, "Login required"));
  }
  return next();
}

export function requireAdmin(req, res, next) {
  const auth = resolveAuth(req);
  if (!auth?.userId || !auth.isAdmin) {
    return next(new ApiError(401, "Unauthorized"));
  }
  return next();
}
