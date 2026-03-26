import app from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { env } from "./config/env.js";
import { User } from "./models/User.js";
import { hashPassword } from "./utils/password.js";

async function ensureDevelopmentAdmin() {
  if (env.nodeEnv !== "development") return;

  const adminEmail = String(process.env.ADMIN_EMAIL || "admin@123.com").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "admin123").trim();
  if (!adminEmail || !adminPassword) return;

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

  console.log(`Development admin ensured: ${adminEmail}`);
}

async function bootstrap() {
  await connectMongo();
  await ensureDevelopmentAdmin();
  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
