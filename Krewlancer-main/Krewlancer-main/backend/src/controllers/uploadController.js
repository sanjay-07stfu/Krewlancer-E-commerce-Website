import path from "path";
import fs from "fs";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { requireAdminContext, requireAuthContext } from "../utils/auth.js";

const uploadsRoot = path.resolve(process.cwd(), "backend", "uploads");

const profileAllowedExt = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

function storageFor(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadsRoot, folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    }
  });
}

function profileFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!profileAllowedExt.has(ext)) {
    return cb(new ApiError(400, "File type not allowed"));
  }
  return cb(null, true);
}

export const uploadProductMiddleware = multer({ storage: storageFor("products") }).single("file");
export const uploadProfileMiddleware = multer({ storage: storageFor("profiles"), fileFilter: profileFileFilter }).single("file");

export const uploadProduct = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  if (!req.file) {
    throw new ApiError(400, "No selected file");
  }
  const relativePath = `/uploads/products/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    url: `${env.backendUrl.replace(/\/+$/, "")}${relativePath}`,
    path: relativePath
  });
});

export const uploadProfile = asyncHandler(async (req, res) => {
  requireAuthContext(req);
  if (!req.file) {
    throw new ApiError(400, "No selected file");
  }
  const relativePath = `/uploads/profiles/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    url: `${env.backendUrl.replace(/\/+$/, "")}${relativePath}`,
    path: relativePath
  });
});
