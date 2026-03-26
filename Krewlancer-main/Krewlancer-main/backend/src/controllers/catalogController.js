import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { CartItem } from "../models/CartItem.js";
import { WishlistItem } from "../models/WishlistItem.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { sendNewArrivalNotification } from "../services/notificationService.js";
import { requireAdminContext, requireAuthContext, resolveAuth } from "../utils/auth.js";

export const getProducts = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.category && req.query.category !== "all") query.category = req.query.category;
  if (req.query.gender && req.query.gender !== "all") query.gender = req.query.gender;

  if (req.query.search) {
    const search = String(req.query.search);
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (req.query.min_price || req.query.max_price) {
    query.price = {};
    if (req.query.min_price) query.price.$gte = Number(req.query.min_price);
    if (req.query.max_price) query.price.$lte = Number(req.query.max_price);
  }

  const sort = req.query.sort === "price_asc" ? { price: 1 } : req.query.sort === "price_desc" ? { price: -1 } : { created_at: -1 };
  const products = await Product.find(query).sort(sort);
  return res.json(products.map((p) => p.toApi()));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).catch(() => null);
  if (!product) throw new ApiError(404, "Product not available");
  return res.status(200).json(product.toApi());
});

export const addProduct = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const data = req.body || {};
  const required = ["name", "price", "category", "description", "images", "sizes"];
  for (const field of required) {
    if (!(field in data)) throw new ApiError(400, `Field '${field}' is required`);
  }

  const product = await Product.create({
    name: data.name,
    price: Number(data.price),
    category: data.category,
    subcategory: data.subcategory || "",
    gender: data.gender || "Unisex",
    description: data.description,
    images: data.images || [],
    sizes: data.sizes || [],
    stock: Number(data.stock || 0),
    is_featured: !!data.featured,
    is_new: !!data.newArrival,
    is_bestseller: !!data.bestseller,
    fabric: data.fabric || "",
    care: data.care || "",
    size_guide_image: data.sizeGuideImage || ""
  });

  let notificationStats = null;

  if (data.notify_users) {
    const users = await User.find({});
    const results = await Promise.allSettled(
      users.map((u) =>
        sendNewArrivalNotification(
          u.email,
          u.first_name || u.email.split("@")[0],
          product.name,
          product.price,
          product.category,
          product.description,
          String(product._id),
          product.images?.[0] || ""
        )
      )
    );

    const attempted = users.length;
    const sent = results.filter((r) => r.status === "fulfilled" && r.value === true).length;
    const failed = attempted - sent;
    notificationStats = { attempted, sent, failed };

    if (failed > 0) {
      console.warn(`[Notifications] Product ${String(product._id)} email send failures: ${failed}/${attempted}`);
    }
  }

  const message = notificationStats
    ? `Product added successfully. Notifications sent: ${notificationStats.sent}/${notificationStats.attempted}`
    : "Product added successfully";

  return res.status(201).json({
    success: true,
    message,
    id: String(product._id),
    notifications: notificationStats
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, "Product not available");

  const map = {
    name: "name",
    price: "price",
    category: "category",
    subcategory: "subcategory",
    gender: "gender",
    description: "description",
    images: "images",
    sizes: "sizes",
    stock: "stock",
    fabric: "fabric",
    care: "care",
    sizeGuideImage: "size_guide_image"
  };

  for (const [src, dst] of Object.entries(map)) {
    if (req.body[src] !== undefined) {
      product[dst] = src === "price" || src === "stock" ? Number(req.body[src]) : req.body[src];
    }
  }
  if (req.body.featured !== undefined) product.is_featured = !!req.body.featured;
  if (req.body.newArrival !== undefined) product.is_new = !!req.body.newArrival;
  if (req.body.bestseller !== undefined) product.is_bestseller = !!req.body.bestseller;

  await product.save();
  return res.status(200).json({ success: true, message: "Product updated successfully" });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const deleted = await Product.findByIdAndDelete(req.params.productId);
  if (!deleted) throw new ApiError(404, "Product not available");
  return res.status(200).json({ success: true, message: "Product deleted" });
});

export const getCart = asyncHandler(async (req, res) => {
  const auth = resolveAuth(req);
  if (!auth?.userId) return res.json(req.session?.cart || []);

  const items = await CartItem.find({ user_id: auth.userId });
  const results = [];
  for (const item of items) {
    const product = await Product.findById(item.product_id_str).catch(() => null);
    if (!product) continue;
    results.push({
      id: String(product._id),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      quantity: item.quantity,
      size: item.size
    });
  }
  return res.json(results);
});

export const addToCart = asyncHandler(async (req, res) => {
  const productId = String(req.body?.id || "");
  const quantity = Number(req.body?.quantity || 1);
  const size = req.body?.size;

  if (!productId) throw new ApiError(400, "Product ID required");

  const auth = resolveAuth(req);

  if (auth?.userId) {
    const existing = await CartItem.findOne({ user_id: auth.userId, product_id_str: productId, size });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await CartItem.create({ user_id: auth.userId, product_id_str: productId, quantity, size });
    }
  } else {
    const cart = req.session.cart || [];
    const found = cart.find((i) => i.id === productId && i.size === size);
    if (found) found.quantity += quantity;
    else cart.push({ id: productId, quantity, size });
    req.session.cart = cart;
  }

  return res.json({ success: true, message: "Added to cart" });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const auth = requireAuthContext(req);

  const items = await WishlistItem.find({ user_id: auth.userId });
  const result = [];
  for (const item of items) {
    const product = await Product.findById(item.product_id_str).catch(() => null);
    if (!product) continue;
    result.push({
      id: String(product._id),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      category: product.category
    });
  }
  return res.json(result);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const auth = requireAuthContext(req);
  const productId = String(req.body?.product_id || "");
  if (!productId) throw new ApiError(400, "Product ID required");

  const exists = await WishlistItem.findOne({ user_id: auth.userId, product_id_str: productId });
  if (exists) return res.status(200).json({ message: "Already in wishlist" });

  await WishlistItem.create({ user_id: auth.userId, product_id_str: productId });
  return res.status(201).json({ success: true });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const auth = requireAuthContext(req);
  await WishlistItem.deleteOne({ user_id: auth.userId, product_id_str: String(req.params.productId) });
  return res.json({ success: true });
});

export const getOrAddReviews = asyncHandler(async (req, res) => {
  const productId = String(req.params.productId);

  if (req.method === "POST") {
    const auth = requireAuthContext(req);
    const rating = Number(req.body?.rating || 0);
    const comment = req.body?.comment;
    if (!rating) throw new ApiError(400, "Rating required");

    const user = await User.findById(auth.userId);
    await Review.create({
      user_id: user?._id,
      user_email: user?.email || "Anonymous",
      product_id_str: productId,
      rating,
      comment
    });
    return res.status(201).json({ success: true });
  }

  const reviews = await Review.find({ product_id_str: productId }).sort({ created_at: -1 });
  return res.json(reviews.map((r) => r.toApi()));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ created_at: 1, _id: 1 });
  return res.json(categories.map((c) => c.toApi()));
});

export const addCategory = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const name = String(req.body?.name || "").trim();
  const subcategory = String(req.body?.subcategory || "").trim();
  if (!name) throw new ApiError(400, "Category name required");

  const existing = await Category.findOne({ name });
  if (existing) {
    if (subcategory && !existing.subcategories.includes(subcategory)) {
      existing.subcategories.push(subcategory);
      await existing.save();
      return res.status(201).json({ success: true, message: "Subcategory added" });
    }
    throw new ApiError(400, "Category already exists");
  }

  await Category.create({ name, subcategories: subcategory ? [subcategory] : [] });
  return res.status(201).json({ success: true, message: "Category created" });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const deleted = await Category.findByIdAndDelete(req.params.catId);
  if (!deleted) throw new ApiError(404, "Category not found");
  return res.status(200).json({ success: true, message: "Category deleted" });
});

export const deleteSubcategory = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const subcategory = req.body?.subcategory;
  if (!subcategory) throw new ApiError(400, "Subcategory name required");

  const category = await Category.findById(req.params.catId);
  if (!category || !category.subcategories.includes(subcategory)) {
    throw new ApiError(404, "Category or subcategory not found");
  }

  category.subcategories = category.subcategories.filter((s) => s !== subcategory);
  await category.save();
  return res.status(200).json({ success: true, message: "Subcategory deleted" });
});
