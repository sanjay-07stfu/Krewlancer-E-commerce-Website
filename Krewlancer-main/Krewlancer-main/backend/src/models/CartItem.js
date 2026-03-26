import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product_id_str: { type: String, required: true, index: true },
    quantity: { type: Number, default: 1 },
    size: { type: String, default: "" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

cartItemSchema.index({ user_id: 1, product_id_str: 1, size: 1 }, { unique: true });

export const CartItem = mongoose.model("CartItem", cartItemSchema);
