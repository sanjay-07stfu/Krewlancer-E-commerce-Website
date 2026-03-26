import { Router } from "express";
import {
  addCategory,
  addProduct,
  addToCart,
  addToWishlist,
  deleteCategory,
  deleteProduct,
  deleteSubcategory,
  getCart,
  getCategories,
  getOrAddReviews,
  getProduct,
  getProducts,
  getWishlist,
  removeFromWishlist,
  updateProduct
} from "../controllers/catalogController.js";

const router = Router();

router.get("/api/products", getProducts);
router.post("/api/products", addProduct);
router.get("/api/products/:productId", getProduct);
router.put("/api/products/:productId", updateProduct);
router.delete("/api/products/:productId", deleteProduct);
router.route("/api/products/:productId/reviews").get(getOrAddReviews).post(getOrAddReviews);

router.get("/api/cart", getCart);
router.post("/api/cart", addToCart);

router.get("/api/wishlist", getWishlist);
router.post("/api/wishlist", addToWishlist);
router.delete("/api/wishlist/:productId", removeFromWishlist);

router.get("/api/categories", getCategories);
router.post("/api/categories", addCategory);
router.delete("/api/categories/:catId", deleteCategory);
router.delete("/api/categories/:catId/subcategories", deleteSubcategory);

export default router;
