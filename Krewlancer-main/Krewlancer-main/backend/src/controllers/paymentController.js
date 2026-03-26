import crypto from "crypto";
import asyncHandler from "express-async-handler";
import { getRazorpayClient } from "../config/razorpay.js";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import { requireAdminContext, requireAuthContext } from "../utils/auth.js";

function requireRazorpayClient() {
  const client = getRazorpayClient();
  if (!client) {
    throw new ApiError(500, "Razorpay is not configured");
  }
  return client;
}

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpayClient = requireRazorpayClient();
  const auth = requireAuthContext(req);
  const amount = Number(req.body?.amount || 0);
  if (!amount) throw new ApiError(400, "Amount required");

  const order = await razorpayClient.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    payment_capture: 1
  });

  await Payment.create({
    user_id: auth.userId,
    razorpay_order_id: order.id,
    amount,
    currency: "INR",
    status: "pending"
  });

  return res.status(200).json(order);
});

export const createPaymentQr = asyncHandler(async (req, res) => {
  const razorpayClient = requireRazorpayClient();
  const auth = requireAuthContext(req);
  const amount = Number(req.body?.amount || 0);
  if (!amount) throw new ApiError(400, "Amount required");

  const va = await razorpayClient.virtualAccount.create({
    receiver_types: ["qr_code"],
    description: "Order Payment",
    amount: Math.round(amount * 100),
    currency: "INR",
    notes: { user_id: auth.userId }
  });

  const qr = va.receivers?.find((r) => r.type === "qr_code") || va.receivers?.[0] || {};
  return res.status(200).json({ success: true, qr_id: va.id, qr_url: qr.url, vpa: qr.vpa });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(payload)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  return res.status(200).json({ success: true });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  requireRazorpayClient();
  const event = req.body?.event;
  if (["payment.captured", "order.paid"].includes(event)) {
    const paymentEntity = req.body?.payload?.payment?.entity;
    if (paymentEntity?.order_id) {
      const payment = await Payment.findOne({ razorpay_order_id: paymentEntity.order_id });
      if (payment) {
        payment.razorpay_payment_id = paymentEntity.id;
        payment.status = "captured";
        payment.method = paymentEntity.method || "";
        payment.email = paymentEntity.email || "";
        payment.phone = paymentEntity.contact || "";
        await payment.save();
      }

      const order = await Order.findOne({ razorpay_order_id: paymentEntity.order_id });
      if (order) {
        order.payment_status = "Paid";
        order.razorpay_payment_id = paymentEntity.id;
        await order.save();
      }
    }
  }

  return res.status(200).json({ success: true });
});

export const getAdminPayments = asyncHandler(async (req, res) => {
  requireAdminContext(req);
  const payments = await Payment.find({}).sort({ created_at: -1 });
  return res.status(200).json(payments.map((p) => p.toApi()));
});

export const refundPayment = asyncHandler(async (req, res) => {
  const razorpayClient = requireRazorpayClient();
  requireAdminContext(req);

  const paymentId = req.body?.razorpay_payment_id;
  const amount = req.body?.amount ? Math.round(Number(req.body.amount) * 100) : undefined;
  if (!paymentId) throw new ApiError(400, "Razorpay Payment ID is required");

  const refund = await razorpayClient.payments.refund(paymentId, amount ? { amount } : {});

  const payment = await Payment.findOne({ razorpay_payment_id: paymentId });
  if (payment) {
    payment.status = "refunded";
    await payment.save();
    if (payment.order_id) {
      const order = await Order.findById(payment.order_id);
      if (order) {
        order.payment_status = "Refunded";
        order.status = "Cancelled";
        await order.save();
      }
    }
  }

  return res.status(200).json({ success: true, refund });
});

export const checkQrStatus = asyncHandler(async (req, res) => {
  const razorpayClient = requireRazorpayClient();
  requireAuthContext(req);
  const qrId = req.body?.qr_id;
  if (!qrId) throw new ApiError(400, "QR ID required");

  const payments = await razorpayClient.virtualAccount.fetchPayments(qrId);
  const paid = payments?.items?.find((p) => ["captured", "authorized"].includes(p.status));
  if (paid) {
    return res.status(200).json({ success: true, status: "Paid", payment_id: paid.id });
  }
  return res.status(200).json({ success: false, status: "Pending" });
});
