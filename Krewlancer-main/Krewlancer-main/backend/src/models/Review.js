import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user_email: { type: String, default: "Anonymous" },
    product_id_str: { type: String, required: true, index: true },
    rating: { type: Number, required: true },
    comment: { type: String, default: "" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

reviewSchema.methods.toApi = function toApi() {
  return {
    id: String(this._id),
    user: this.user_email,
    rating: this.rating,
    comment: this.comment,
    date: this.created_at?.toISOString() || ""
  };
};

export const Review = mongoose.model("Review", reviewSchema);
