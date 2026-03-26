import Razorpay from "razorpay";
import { env } from "./env.js";

let client = null;

export function getRazorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return null;
  }
  if (!client) {
    client = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret
    });
  }
  return client;
}
