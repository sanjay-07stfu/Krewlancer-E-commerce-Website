import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    id: { type: Number },
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: "US" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    phone: { type: String, default: "" },
    profile_pic: { type: String, default: "" },
    is_admin: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
    addresses: { type: [addressSchema], default: [] }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userSchema.methods.toAuthProfile = function toAuthProfile() {
  return {
    user: this.email,
    id: String(this._id),
    firstName: this.first_name || "",
    lastName: this.last_name || "",
    phone: this.phone || "",
    profilePic: this.profile_pic || "",
    isAdmin: !!this.is_admin,
    isBlocked: !!this.is_blocked,
    addresses: this.addresses || []
  };
};

export const User = mongoose.model("User", userSchema);
