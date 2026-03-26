import { Router } from "express";
import { uploadProduct, uploadProductMiddleware, uploadProfile, uploadProfileMiddleware } from "../controllers/uploadController.js";

const router = Router();

router.post("/api/upload", uploadProductMiddleware, uploadProduct);
router.post("/api/upload/profile", uploadProfileMiddleware, uploadProfile);

export default router;
