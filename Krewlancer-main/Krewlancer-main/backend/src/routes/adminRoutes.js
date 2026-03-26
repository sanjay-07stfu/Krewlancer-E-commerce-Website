import { Router } from "express";
import {
  getAnalysis,
  getCustomerProfile,
  getCustomers,
  getHomepageConfig,
  updateCustomerStatus,
  updateHomepageConfig
} from "../controllers/adminController.js";

const router = Router();

router.get("/api/homepage", getHomepageConfig);
router.post("/api/homepage", updateHomepageConfig);
router.get("/api/admin/analysis", getAnalysis);
router.get("/api/admin/customers", getCustomers);
router.get("/api/admin/customers/:customerId", getCustomerProfile);
router.put("/api/admin/customers/:customerId/status", updateCustomerStatus);

export default router;
