import { Router } from "express";
import {
  borzoWebhook,
  createOrder,
  dispatchOrder,
  getAdminOrderDetail,
  getAdminOrders,
  getUserOrders,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = Router();

router.post("/api/orders", createOrder);
router.get("/api/orders", getUserOrders);

router.get("/api/admin/orders", getAdminOrders);
router.get("/api/admin/orders/:orderId", getAdminOrderDetail);
router.put("/api/admin/orders/:orderId/status", updateOrderStatus);
router.post("/api/admin/dispatch/:orderId", dispatchOrder);

router.post("/api/webhooks/borzo", borzoWebhook);

export default router;
