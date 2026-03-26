import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    razorpay_order_id: { type: String, unique: true, sparse: true },
    razorpay_payment_id: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending" },
    method: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    error_code: { type: String, default: "" },
    error_description: { type: String, default: "" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

paymentSchema.methods.toApi = function toApi() {
  return {
    id: String(this._id),
    user_id: this.user_id ? String(this.user_id) : null,
    order_id: this.order_id ? String(this.order_id) : null,
    razorpay_order_id: this.razorpay_order_id,
    razorpay_payment_id: this.razorpay_payment_id,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    method: this.method,
    email: this.email,
    phone: this.phone,
    created_at: this.created_at?.toISOString() || null,
    updated_at: this.updated_at?.toISOString() || null
  };
};

export const Payment = mongoose.model("Payment", paymentSchema);
