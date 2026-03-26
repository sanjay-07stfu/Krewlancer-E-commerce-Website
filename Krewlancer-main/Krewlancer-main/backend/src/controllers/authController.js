import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { PASSWORD_POLICY_REGEX, comparePassword, hashPassword } from "../utils/password.js";
import {
  sendLoginWelcomeNotification,
  sendPasswordChangeConfirmation,
  sendSignupConfirmation
} from "../services/notificationService.js";
import { env } from "../config/env.js";
import { clearAuthCookie, resolveAuth, setAuthCookie } from "../utils/auth.js";

const mapUserResponse = (user) => ({
  success: true,
  message: "Login successful!",
  user: user.email,
  firstName: user.first_name || user.email.split("@")[0],
  lastName: user.last_name || "",
  phone: user.phone || "",
  profilePic: user.profile_pic || "",
  id: String(user._id),
  isAdmin: !!user.is_admin,
  addresses: user.addresses || []
});

export const signup = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password;
  const firstName = String(req.body?.firstName || "").trim();
  const lastName = String(req.body?.lastName || "").trim();
  const phone = String(req.body?.phone || "").trim();
  const termsAccepted = !!req.body?.termsAccepted;

  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }
  if (!PASSWORD_POLICY_REGEX.test(password)) {
    throw new ApiError(400, "Password must be at least 8 characters and include a letter, a number, and a special character");
  }
  if (!termsAccepted) {
    throw new ApiError(400, "Terms and Conditions must be accepted");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "Email already registered");
  }

  const newUser = await User.create({
    email,
    password: await hashPassword(password),
    first_name: firstName,
    last_name: lastName,
    phone,
    is_admin: false
  });

  req.session.userId = String(newUser._id);
  req.session.isAdmin = false;
  req.session.isNewSignup = true;
  setAuthCookie(res, { userId: String(newUser._id), isAdmin: false });

  await sendSignupConfirmation(email, firstName);

  return res.status(201).json({
    success: true,
    message: "Signup successful!",
    user: email,
    firstName,
    lastName,
    phone,
    id: String(newUser._id)
  });
});

export const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password;

  if (!identifier || !password) {
    throw new ApiError(400, "Email/username and password required");
  }

  let user = await User.findOne({ email: identifier });
  if (!user && !identifier.includes("@")) {
    const regex = new RegExp(`^${identifier}@`, "i");
    const candidates = await User.find({ email: regex }).sort({ created_at: 1 }).limit(2);
    if (candidates.length === 1) {
      user = candidates[0];
    }
  }

  const storedPasswordHash = user?.password || user?.password_hash || user?.passwordHash;
  if (!user || !storedPasswordHash || !(await comparePassword(password, storedPasswordHash))) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.is_blocked) {
    throw new ApiError(403, "Your account has been blocked. Please contact support.");
  }

  req.session.userId = String(user._id);
  req.session.isAdmin = !!user.is_admin;
  setAuthCookie(res, { userId: String(user._id), isAdmin: !!user.is_admin });

  await sendLoginWelcomeNotification(user.email, user.first_name || user.email.split("@")[0]);

  return res.status(200).json(mapUserResponse(user));
});

export const getOrUpdateUser = asyncHandler(async (req, res) => {
  const auth = resolveAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(200).json({ user: null });
  }

  const user = await User.findById(userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(200).json({ user: null });
  }

  if (req.method === "PUT") {
    const data = req.body || {};
    user.first_name = data.firstName ?? user.first_name;
    user.last_name = data.lastName ?? user.last_name;
    user.phone = data.phone ?? user.phone;
    user.profile_pic = data.profilePic ?? user.profile_pic;
    await user.save();
    return res.status(200).json({ success: true, message: "Profile updated", user: user.email, id: String(user._id) });
  }

  return res.status(200).json({
    ...user.toAuthProfile(),
    isNewSignup: !!req.session.isNewSignup
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.status(200).json({ success: true, message: "Logged out" });
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const auth = resolveAuth(req);
  if (!auth?.userId) throw new ApiError(401, "Unauthorized");

  const currentPassword = req.body?.currentPassword;
  const newPassword = req.body?.newPassword;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password required");
  }

  if (!PASSWORD_POLICY_REGEX.test(newPassword)) {
    throw new ApiError(400, "New password must be at least 8 characters and include a letter, a number, and a special character");
  }

  const user = await User.findById(auth.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const storedPasswordHash = user.password || user.password_hash || user.passwordHash;
  if (!storedPasswordHash || !(await comparePassword(currentPassword, storedPasswordHash))) {
    throw new ApiError(400, "Incorrect current password");
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  const mailSent = await sendPasswordChangeConfirmation(user.email, user.first_name || "User");
  if (!mailSent) {
    return res.status(200).json({
      success: true,
      message: "Password updated, but there was an error sending the confirmation email. Please check your contact details."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Password updated successfully. A confirmation email has been sent."
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.redirect(`${env.frontendUrl}/login?error=google_oauth_not_configured`);
  }

  // Placeholder for OAuth integration; preserves route behavior and safe redirect.
  return res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
});

export const googleCallback = asyncHandler(async (req, res) => {
  // Placeholder callback for compatibility.
  return res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
});

export const addAddress = asyncHandler(async (req, res) => {
  const auth = resolveAuth(req);
  if (!auth?.userId) throw new ApiError(401, "Login required");

  const user = await User.findById(auth.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = {
    id: Date.now(),
    street: req.body?.street,
    city: req.body?.city,
    state: req.body?.state,
    zip: req.body?.zip,
    country: req.body?.country || "US"
  };

  user.addresses = [...(user.addresses || []), address];
  await user.save();

  return res.status(201).json({ success: true, message: "Address added" });
});

export const upsertOAuthUser = async ({ email, firstName = "", lastName = "", picture = "" }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      password: crypto.randomBytes(24).toString("hex"),
      first_name: firstName,
      last_name: lastName,
      profile_pic: picture,
      is_admin: false
    });
    await sendSignupConfirmation(email, firstName);
  } else if (picture && user.profile_pic !== picture) {
    user.profile_pic = picture;
    await user.save();
  }
  return user;
};
