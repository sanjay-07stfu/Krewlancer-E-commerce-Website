import mongoose from "mongoose";
import { publicAssetUrl } from "../utils/urls.js";

const homepageConfigSchema = new mongoose.Schema(
  {
    config_type: { type: String, unique: true, default: "main" },
    hero_slides: { type: [Object], default: [] },
    manifesto_text: { type: String, default: "" },
    bestseller_ids: { type: [String], default: [] },
    featured_ids: { type: [String], default: [] },
    new_arrival_ids: { type: [String], default: [] }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

homepageConfigSchema.methods.toApi = function toApi() {
  const normalizeIds = (ids) =>
    (Array.isArray(ids) ? ids : [])
      .map((id) => (id == null ? "" : String(id).trim()))
      .filter(Boolean);

  const normalizedSlides = (this.hero_slides || []).map((slide) => {
    if (!slide || typeof slide !== "object") return slide;
    return {
      ...slide,
      image: publicAssetUrl(slide.image)
    };
  });

  return {
    hero_slides: normalizedSlides,
    manifesto_text: this.manifesto_text,
    bestseller_product_ids: normalizeIds(this.bestseller_ids),
    featured_product_ids: normalizeIds(this.featured_ids),
    new_arrival_product_ids: normalizeIds(this.new_arrival_ids),
    updated_at: this.updated_at?.toISOString() || null
  };
};

export const HomepageConfig = mongoose.model("HomepageConfig", homepageConfigSchema);
