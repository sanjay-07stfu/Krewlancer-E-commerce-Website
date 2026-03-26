import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import { WishlistItem } from "../models/WishlistItem.js";
import { CartItem } from "../models/CartItem.js";
import { Order } from "../models/Order.js";
import { HomepageConfig } from "../models/HomepageConfig.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { requireAdminContext } from "../utils/auth.js";

export const getHomepageConfig = asyncHandler(async (req, res) => {
  const config = await HomepageConfig.findOne({ config_type: "main" });
  const fallback = {
    hero_slides: [
      {
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
        content: "",
        product_id: "",
        target_category: "",
        target_subcategory: ""
      }
    ],
    manifesto_text:
      "We believe in the quiet power of silence. In a world of noise, krewlancer is the absence of it. We strip away the unnecessary to reveal the essential structure of the human form. This is not just clothing; this is architecture for the soul.",
    bestseller_product_ids: [],
    featured_product_ids: [],
    new_arrival_product_ids: []
  };

  if (!config) return res.json(fallback);
  return res.json(config.toApi());
});

export const updateHomepageConfig = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  const data = req.body || {};
  const normalizeIds = (ids) =>
    [...new Set((Array.isArray(ids) ? ids : [])
      .map((id) => (id == null ? "" : String(id).trim()))
      .filter(Boolean))];

  const update = {
    hero_slides: data.hero_slides || [],
    manifesto_text: data.manifesto_text,
    bestseller_ids: normalizeIds(data.bestseller_product_ids),
    featured_ids: normalizeIds(data.featured_product_ids),
    new_arrival_ids: normalizeIds(data.new_arrival_product_ids)
  };

  await HomepageConfig.findOneAndUpdate({ config_type: "main" }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
  return res.status(200).json({ success: true, message: "Homepage updated successfully" });
});

export const getAnalysis = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  const mostSoldRaw = await Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.product_name", total_sold: { $sum: "$items.quantity" }, total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } },
    { $sort: { total_sold: -1 } },
    { $limit: 10 }
  ]);

  const mostSold = mostSoldRaw.map((r) => ({ id: r._id, name: r._id, total_sold: Number(r.total_sold), total_revenue: Number(r.total_revenue || 0) }));

  const favCounts = await WishlistItem.aggregate([
    { $group: { _id: "$product_id_str", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  const favProducts = await Product.find({ _id: { $in: favCounts.map((f) => f._id).filter(Boolean) } });
  const favMap = new Map(favProducts.map((p) => [String(p._id), p]));
  const mostFavorited = favCounts.map((r) => ({ id: r._id, name: favMap.get(String(r._id))?.name || "Unknown", count: Number(r.count) }));

  const cartCounts = await CartItem.aggregate([
    { $group: { _id: "$product_id_str", total_quantity: { $sum: "$quantity" }, user_set: { $addToSet: "$user_id" } } },
    { $project: { total_quantity: 1, user_count: { $size: "$user_set" } } },
    { $sort: { total_quantity: -1 } },
    { $limit: 10 }
  ]);
  const cartProducts = await Product.find({ _id: { $in: cartCounts.map((c) => c._id).filter(Boolean) } });
  const cartMap = new Map(cartProducts.map((p) => [String(p._id), p]));
  const mostAddedToCart = cartCounts.map((r) => ({ id: r._id, name: cartMap.get(String(r._id))?.name || "Unknown", total_quantity: Number(r.total_quantity), user_count: Number(r.user_count) }));

  const products = await Product.find({}).sort({ stock: 1 });
  const allStock = products.map((p) => ({ id: String(p._id), name: p.name, stock: p.stock, category: p.category || "Uncategorized", subcategory: p.subcategory || "General" }));
  const lowStock = allStock.filter((p) => p.stock <= 5);

  const categoryMap = new Map();
  for (const p of allStock) {
    const c = p.category || "Uncategorized";
    if (!categoryMap.has(c)) {
      categoryMap.set(c, { name: c, count: 0, total_stock: 0, subcategories: new Map() });
    }
    const cObj = categoryMap.get(c);
    cObj.count += 1;
    cObj.total_stock += p.stock;

    const s = p.subcategory || "General";
    if (!cObj.subcategories.has(s)) {
      cObj.subcategories.set(s, { name: s, count: 0, total_stock: 0, products: [] });
    }
    const sObj = cObj.subcategories.get(s);
    sObj.count += 1;
    sObj.total_stock += p.stock;
    sObj.products.push({ id: p.id, name: p.name, stock: p.stock });
  }

  const categoryStats = Array.from(categoryMap.values()).map((c) => ({ ...c, subcategories: Array.from(c.subcategories.values()) }));
  const pieData = categoryStats.map((c) => ({ _id: c.name, count: c.count }));

  return res.status(200).json({
    most_sold: mostSold,
    most_favorited: mostFavorited,
    most_added_to_cart: mostAddedToCart,
    low_stock: lowStock,
    all_stock: allStock,
    category_stats: categoryStats,
    pie_data: pieData
  });
});

export const getCustomers = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  const users = await User.find({ is_admin: false });
  const userIds = users.map((u) => u._id);
  const orders = await Order.find({ user_id: { $in: userIds } });

  const byUser = new Map();
  for (const order of orders) {
    const key = String(order.user_id);
    if (!byUser.has(key)) byUser.set(key, []);
    byUser.get(key).push(order);
  }

  const payload = users.map((user) => {
    const userOrders = byUser.get(String(user._id)) || [];
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
      id: String(user._id),
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
      email: user.email,
      phone: user.phone || "N/A",
      date_joined: user.created_at?.toISOString() || null,
      is_blocked: !!user.is_blocked,
      total_orders: totalOrders,
      total_spent: totalSpent
    };
  });

  return res.status(200).json(payload);
});

export const getCustomerProfile = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  const user = await User.findById(req.params.customerId);
  if (!user) throw new ApiError(404, "Customer not found");

  const orders = await Order.find({ user_id: user._id }).sort({ created_at: -1 });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrderValue = totalOrders ? totalSpent / totalOrders : 0;

  let address = user.addresses?.[0] || null;
  if (!address) {
    for (const o of orders) {
      if (o.shipping_address && Object.keys(o.shipping_address).length > 0) {
        address = o.shipping_address;
        break;
      }
    }
  }

  return res.status(200).json({
    id: String(user._id),
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email,
    phone: user.phone || "N/A",
    date_joined: user.created_at?.toISOString() || null,
    is_blocked: !!user.is_blocked,
    address,
    stats: {
      total_orders: totalOrders,
      total_spent: totalSpent,
      avg_order_value: avgOrderValue
    },
    orders: orders.map((o) => o.toApi())
  });
});

export const updateCustomerStatus = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  if (req.body?.is_blocked === undefined) {
    throw new ApiError(400, "is_blocked status is required");
  }

  const user = await User.findById(req.params.customerId);
  if (!user) throw new ApiError(404, "Customer not found");

  user.is_blocked = !!req.body.is_blocked;
  await user.save();

  const action = user.is_blocked ? "blocked" : "unblocked";
  return res.status(200).json({ success: true, message: `Customer successfully ${action}.` });
});
