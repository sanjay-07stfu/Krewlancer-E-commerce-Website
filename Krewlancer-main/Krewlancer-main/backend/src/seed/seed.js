import { connectMongo } from "../config/mongo.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { hashPassword } from "../utils/password.js";

async function seed() {
  await connectMongo();

  const adminEmail = "admin@123.com";
  const adminPassword = "admin123";

  const hashed = await hashPassword(adminPassword);
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      email: adminEmail,
      password: hashed,
      is_admin: true,
      first_name: "Admin",
      last_name: "User"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const defaults = [
    { name: "Knitwear", subcategories: ["Sweaters", "Cardigans"] },
    { name: "Trousers", subcategories: ["Tailored", "Casual"] },
    { name: "Basics", subcategories: ["Tees"] },
    { name: "Shirts", subcategories: ["Formal"] },
    { name: "Accessories", subcategories: ["Bags", "Scarf"] }
  ];

  for (const c of defaults) {
    await Category.findOneAndUpdate({ name: c.name }, { $setOnInsert: c }, { upsert: true, new: true });
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
