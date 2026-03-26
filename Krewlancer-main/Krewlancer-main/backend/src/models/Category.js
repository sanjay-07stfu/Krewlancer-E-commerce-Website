import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    subcategories: { type: [String], default: [] }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

categorySchema.methods.toApi = function toApi() {
  return {
    id: String(this._id),
    name: this.name,
    subcategories: this.subcategories || [],
    createdAt: this.created_at?.toISOString() || null
  };
};

export const Category = mongoose.model("Category", categorySchema);
