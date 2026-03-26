import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  addAddress,
  changePassword,
  getOrUpdateUser,
  googleCallback,
  googleLogin,
  login,
  logout,
  signup
} from "../controllers/authController.js";

const router = Router();

const signupLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: "Too many signup attempts" } });
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: "Too many login attempts" } });

router.post("/api/auth/signup", signupLimiter, signup);
router.post("/api/auth/login", loginLimiter, login);
router.route("/api/auth/user").get(getOrUpdateUser).put(getOrUpdateUser);
router.post("/api/auth/logout", logout);
router.post("/api/auth/change-password", changePassword);
router.get("/api/auth/google/login", googleLogin);
router.get("/api/auth/google/callback", googleCallback);
router.post("/api/user/addresses", addAddress);

export default router;
