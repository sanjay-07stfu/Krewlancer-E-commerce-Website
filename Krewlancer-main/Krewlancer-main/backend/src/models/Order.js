import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_id_str: { type: String, required: true },
    product_name: { type: String, default: "" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: "" }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    order_number: { type: String, unique: true, required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    total: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    payment_status: { type: String, default: "Pending" },
    shipping_address: { type: Object, default: {} },
    borzo_order_id: { type: String, default: "" },
    borzo_tracking_url: { type: String, default: "" },
    razorpay_order_id: { type: String, unique: true, sparse: true },
    razorpay_payment_id: { type: String, unique: true, sparse: true },
    items: { type: [orderItemSchema], default: [] }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

orderSchema.methods.toApi = function toApi() {
  return {
    id: String(this._id),
    order_number: this.order_number,
    total: this.total,
    status: this.status,
    payment_status: this.payment_status,
    razorpay_payment_id: this.razorpay_payment_id,
    shipping_address: this.shipping_address || {},
    createdAt: this.created_at?.toISOString() || null,
    items: (this.items || []).map((item) => ({
      id: String(item._id),
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      size: item.size
    }))
  };
};

export const Order = mongoose.model("Order", orderSchema);
