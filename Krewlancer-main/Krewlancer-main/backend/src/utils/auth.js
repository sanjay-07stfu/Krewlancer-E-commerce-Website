import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./apiError.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDurationToMs(value) {
  const raw = String(value || "7d").trim();
  const match = raw.match(/^(\d+)\s*([smhd])?$/i);
  if (!match) return 7 * DAY_MS;

  const amount = Number(match[1]);
  const unit = (match[2] || "d").toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) return 7 * DAY_MS;

  if (unit === "s") return amount * 1000;
  if (unit === "m") return amount * 60 * 1000;
  if (unit === "h") return amount * 60 * 60 * 1000;
  return amount * DAY_MS;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/"
  };
}

function extractBearerToken(req) {
  const authHeader = req?.headers?.authorization || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

function extractToken(req) {
  const cookieToken = req?.cookies?.[env.jwtCookieName];
  if (cookieToken) return cookieToken;
  return extractBearerToken(req);
}

export function signAuthToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function setAuthCookie(res, { userId, isAdmin }) {
  const token = signAuthToken({ userId: String(userId), isAdmin: !!isAdmin });
  res.cookie(env.jwtCookieName, token, {
    ...getCookieOptions(),
    maxAge: parseDurationToMs(env.jwtExpiresIn)
  });
  return token;
}

export function clearAuthCookie(res) {
  res.clearCookie(env.jwtCookieName, getCookieOptions());
}

function fromJwt(req) {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const decoded = verifyAuthToken(token);
    const userId = decoded?.userId || decoded?.id;
    if (!userId) return null;
    return { userId: String(userId), isAdmin: !!(decoded?.isAdmin || decoded?.is_admin) };
  } catch {
    return null;
  }
}

function fromSession(req) {
  const userId = req?.session?.userId;
  if (!userId) return null;
  return { userId: String(userId), isAdmin: !!req?.session?.isAdmin };
}

export function resolveAuth(req) {
  return fromJwt(req) || fromSession(req);
}

export function requireAuthContext(req) {
  const auth = resolveAuth(req);
  if (!auth?.userId) {
    throw new ApiError(401, "Login required");
  }
  return auth;
}

export function requireAdminContext(req) {
  const auth = requireAuthContext(req);
  if (!auth.isAdmin) {
    throw new ApiError(401, "Unauthorized");
  }
  return auth;
}
