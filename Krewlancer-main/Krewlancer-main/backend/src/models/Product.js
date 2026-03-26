import mongoose from "mongoose";
import { publicAssetUrl } from "../utils/urls.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: "" },
    subcategory: { type: String, default: "" },
    gender: { type: String, default: "Unisex" },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    is_bestseller: { type: Boolean, default: false },
    fabric: { type: String, default: "" },
    care: { type: String, default: "" },
    size_guide_image: { type: String, default: "" }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

productSchema.methods.toApi = function toApi() {
  const normalizedImages = (this.images || []).map((img) => publicAssetUrl(img));
  return {
    id: String(this._id),
    name: this.name,
    price: this.price,
    category: this.category,
    subcategory: this.subcategory,
    gender: this.gender,
    description: this.description,
    images: normalizedImages,
    sizes: this.sizes,
    stock: this.stock,
    isFeatured: this.is_featured,
    isNew: this.is_new,
    isBestseller: this.is_bestseller,
    is_featured: this.is_featured,
    is_new: this.is_new,
    is_bestseller: this.is_bestseller,
    newArrival: this.is_new,
    fabric: this.fabric,
    care: this.care,
    sizeGuideImage: publicAssetUrl(this.size_guide_image),
    createdAt: this.created_at?.toISOString() || null
  };
};

export const Product = mongoose.model("Product", productSchema);
