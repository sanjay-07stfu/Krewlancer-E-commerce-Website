import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const sessionMaxAgeMs = env.authSessionHours * 60 * 60 * 1000;

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

const allowedOrigins = env.allowedOrigins.length ? env.allowedOrigins : [env.frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    name: "connect.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? "none" : "lax",
      maxAge: sessionMaxAgeMs
    },
    store: MongoStore.create({
      mongoUrl: env.mongoUri,
      dbName: env.mongoDbName,
      collectionName: "sessions",
      ttl: env.authSessionHours * 60 * 60
    })
  })
);

app.use("/uploads", express.static(path.resolve(process.cwd(), "backend", "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", payment_configured: !!env.razorpayKeyId, db: "connected" });
});

app.use(authRoutes);
app.use(uploadRoutes);
app.use(catalogRoutes);
app.use(paymentRoutes);
app.use(orderRoutes);
app.use(adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
