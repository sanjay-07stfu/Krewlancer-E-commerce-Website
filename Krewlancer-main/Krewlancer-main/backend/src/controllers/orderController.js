import crypto from "crypto";
import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Payment } from "../models/Payment.js";
import { CartItem } from "../models/CartItem.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { makeOrderNumber } from "../utils/ids.js";
import { env } from "../config/env.js";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "../services/notificationService.js";
import { requireAdminContext, requireAuthContext } from "../utils/auth.js";

function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  return expected === razorpay_signature;
}

export const createOrder = asyncHandler(async (req, res) => {
  const auth = requireAuthContext(req);

  const data = req.body || {};
  if (!data.termsAccepted) {
    throw new ApiError(400, "Terms and Conditions must be accepted before placing an order");
  }

  let paymentStatus = "Pending";
  if (data.razorpay_payment_id && data.razorpay_order_id && data.razorpay_signature) {
    if (
      !verifyRazorpaySignature({
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature
      })
    ) {
      throw new ApiError(400, "Payment verification failed");
    }
    paymentStatus = "Paid";
  }

  const user = await User.findById(auth.userId);
  if (!user) throw new ApiError(404, "User not found");

  const incomingItems = Array.isArray(data.items) ? data.items : [];
  if (!incomingItems.length) throw new ApiError(400, "Order items required");

  let computedSubtotal = 0;
  const validatedItems = [];

  for (const item of incomingItems) {
    const quantity = Number(item.quantity || 0);
    if (quantity <= 0) throw new ApiError(400, "Quantity must be greater than 0");

    const product = await Product.findById(String(item.id)).catch(() => null);
    if (!product) throw new ApiError(404, `Product not found: ${item.id}`);
    if (product.stock < quantity) throw new ApiError(400, `Insufficient stock for ${product.name}`);

    computedSubtotal += Number(product.price) * quantity;
    validatedItems.push({
      product_id_str: String(product._id),
      product_name: product.name,
      quantity,
      size: item.size,
      price: Number(product.price)
    });
  }

  const clientTotal = Number(data.total || 0);
  if (clientTotal + 0.01 < computedSubtotal) throw new ApiError(400, "Total mismatch");

  const order = await Order.create({
    order_number: makeOrderNumber(),
    user_id: user._id,
    total: clientTotal,
    status: "Processing",
    payment_status: paymentStatus,
    shipping_address: data.shippingAddress || {},
    razorpay_order_id: data.razorpay_order_id || undefined,
    razorpay_payment_id: data.razorpay_payment_id || undefined,
    items: validatedItems
  });

  if (data.razorpay_order_id) {
    const payment = await Payment.findOne({ razorpay_order_id: data.razorpay_order_id });
    if (payment) {
      payment.order_id = order._id;
      if (paymentStatus === "Paid") payment.status = "captured";
      await payment.save();
    }
  }

  for (const item of validatedItems) {
    await Product.updateOne({ _id: item.product_id_str, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
  }

  await CartItem.deleteMany({ user_id: user._id });

  await sendOrderConfirmation(user.email, order.order_number, order.total, validatedItems);

  return res.status(201).json({ success: true, message: "Order placed successfully!", orderId: order.order_number });
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const auth = requireAuthContext(req);
  const orders = await Order.find({ user_id: auth.userId }).sort({ created_at: -1 });
  return res.json(orders.map((o) => o.toApi()));
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const orders = await Order.find({}).sort({ created_at: -1 });
  const userIds = orders.map((o) => o.user_id);
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const payload = orders.map((order) => {
    const user = userMap.get(String(order.user_id));
    const o = order.toApi();
    return {
      ...o,
      customerName: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown" : "Unknown",
      customerEmail: user?.email || "Unknown",
      date: order.created_at?.toISOString() || "",
      items: o.items || []
    };
  });

  return res.status(200).json(payload);
});

export const getAdminOrderDetail = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const id = req.params.orderId;

  let order = await Order.findById(id).catch(() => null);
  if (!order) order = await Order.findOne({ order_number: id });
  if (!order) throw new ApiError(404, "Order not found");

  const user = await User.findById(order.user_id);
  const orderDict = order.toApi();
  const frontendItems = (order.items || []).map((item) => ({
    productName: item.product_name,
    quantity: item.quantity,
    price: item.price,
    size: item.size
  }));

  const subtotal = frontendItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return res.status(200).json({
    ...orderDict,
    customerName: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown" : "Unknown",
    customerEmail: user?.email || "Unknown",
    date: order.created_at?.toISOString() || null,
    items: frontendItems,
    subtotal,
    shipping: order.total - subtotal
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  const newStatus = req.body?.status;
  const trackingLink = req.body?.tracking_link;
  if (!newStatus) throw new ApiError(400, "Status required");

  let order = await Order.findById(req.params.orderId).catch(() => null);
  if (!order) order = await Order.findOne({ order_number: req.params.orderId });
  if (!order) throw new ApiError(404, "Order not found");

  order.status = newStatus;
  await order.save();

  const user = await User.findById(order.user_id);
  if (user) {
    await sendOrderStatusUpdate(user.email, order.order_number, newStatus, trackingLink);
  }

  return res.status(200).json({ success: true, message: `Order status updated to ${newStatus}` });
});

export const dispatchOrder = asyncHandler(async (req, res) => {
  requireAdminContext(req);

  const order = await Order.findOne({ order_number: req.params.orderId });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.borzo_order_id) throw new ApiError(400, "Order already dispatched via Borzo");

  // Borzo integration can be wired here with actual API token.
  const borzoId = `BORZO-${Date.now()}`;
  const trackingUrl = `https://tracking.borzodelivery.com/${borzoId}`;

  order.status = "Shipped";
  order.borzo_order_id = borzoId;
  order.borzo_tracking_url = trackingUrl;
  await order.save();

  const user = await User.findById(order.user_id);
  if (user) {
    await sendOrderStatusUpdate(user.email, order.order_number, "Shipped", trackingUrl);
  }

  return res.status(200).json({ success: true, message: "Dispatched via Borzo", tracking_url: trackingUrl });
});

export const borzoWebhook = asyncHandler(async (req, res) => {
  const data = req.body || {};
  const orderData = data.order || {};
  const borzoId = String(orderData.order_id || "");
  const status = orderData.status;

  if (borzoId && status) {
    const internalStatus = status === "completed" ? "Delivered" : status === "canceled" ? "Cancelled" : "Shipped";
    const order = await Order.findOne({ borzo_order_id: borzoId });
    if (order) {
      order.status = internalStatus;
      await order.save();
      const user = await User.findById(order.user_id);
      if (user) {
        await sendOrderStatusUpdate(user.email, order.order_number, internalStatus, order.borzo_tracking_url);
      }
    }
  }

  return res.status(200).json({ success: true });
});
