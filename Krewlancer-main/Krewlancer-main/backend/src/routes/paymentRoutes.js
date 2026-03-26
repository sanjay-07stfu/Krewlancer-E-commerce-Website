import { Router } from "express";
import {
  checkQrStatus,
  createPaymentQr,
  createRazorpayOrder,
  getAdminPayments,
  razorpayWebhook,
  refundPayment,
  verifyPayment
} from "../controllers/paymentController.js";

const router = Router();

router.post("/api/payments/create-order", createRazorpayOrder);
router.post("/api/payments/create-qr", createPaymentQr);
router.post("/api/payments/verify", verifyPayment);
router.post("/api/webhooks/razorpay", razorpayWebhook);
router.post("/api/payments/check-qr-status", checkQrStatus);
router.get("/api/admin/payments", getAdminPayments);
router.post("/api/admin/payments/refund", refundPayment);

export default router;
