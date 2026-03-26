import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const backendEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath, override: true });

const toBool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
};

const toArray = (value) => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const normalizeMailPassword = (password, host) => {
  const raw = String(password || "");
  if (/gmail\.com$/i.test(String(host || "").trim())) {
    return raw.replace(/\s+/g, "");
  }
  return raw;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  port: Number(process.env.PORT || 5004),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  mongoDbName: process.env.MONGODB_DB_NAME || "lkrewlancer",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL || "http://localhost:5004",
  allowedOrigins: toArray(process.env.ALLOWED_ORIGINS),
  authSessionHours: toPositiveInt(process.env.AUTH_SESSION_HOURS, 12),
  sessionSecret: process.env.SESSION_SECRET || process.env.SECRET_KEY || "change-me",
  jwtSecret: process.env.JWT_SECRET || process.env.SESSION_SECRET || process.env.SECRET_KEY || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || `${toPositiveInt(process.env.AUTH_SESSION_HOURS, 12)}h`,
  jwtCookieName: process.env.JWT_COOKIE_NAME || "auth_token",
  trustProxy: toBool(process.env.TRUST_PROXY_HEADERS, true),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  mailHost: process.env.MAIL_SERVER || "",
  mailPort: Number(process.env.MAIL_PORT || 587),
  mailSecure: toBool(process.env.MAIL_USE_SSL, false),
  mailUser: process.env.MAIL_USERNAME || "",
  mailPass: normalizeMailPassword(process.env.MAIL_PASSWORD, process.env.MAIL_SERVER),
  mailFrom: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME || "",
  storeAddress: process.env.STORE_ADDRESS || "Main Store Address, City, State ZIP",
  borzoToken: process.env.BORZO_API_TOKEN || ""
};
