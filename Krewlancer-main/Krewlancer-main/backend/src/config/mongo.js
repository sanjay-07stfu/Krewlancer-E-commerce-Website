import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo() {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  });
  console.log(`Mongo connected: ${mongoose.connection.host}/${env.mongoDbName}`);
}
