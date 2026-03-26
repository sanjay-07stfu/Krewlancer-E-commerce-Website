import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product_id_str: { type: String, required: true, index: true }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

wishlistItemSchema.index({ user_id: 1, product_id_str: 1 }, { unique: true });

export const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema);
