import { sendMail } from "../config/mailer.js";
import { env } from "../config/env.js";
import { publicAssetUrl } from "../utils/urls.js";

function baseTemplate(title, body) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>${title}</h2><div>${body}</div></div>`;
}

export async function sendSignupConfirmation(userEmail, firstName) {
  return sendMail({
    to: userEmail,
    subject: "Welcome to krewlancer",
    html: baseTemplate("Welcome", `<p>Hi ${firstName || "there"}, your account is ready.</p>`)
  });
}

export async function sendLoginWelcomeNotification(userEmail, firstName) {
  const safeName = firstName || "there";
  const shopUrl = env.frontendUrl;

  return sendMail({
    to: userEmail,
    subject: "Hello from krewlancer",
    html: baseTemplate(
      "Hello",
      `<p>Hi ${safeName},</p>
       <p>You have successfully logged in to your krewlancer account.</p>
       <p>Ready to explore the latest drop? Tap below to start shopping now.</p>
       <p><a href="${shopUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:4px">Shop Now</a></p>`
    )
  });
}

export async function sendPasswordChangeConfirmation(userEmail, firstName) {
  return sendMail({
    to: userEmail,
    subject: "Security Alert: Password Changed",
    html: baseTemplate("Password Updated", `<p>Hi ${firstName || "User"}, your password was changed successfully.</p>`)
  });
}

export async function sendOrderConfirmation(userEmail, orderId, total, items) {
  const list = (items || [])
    .map((i) => `<li>${i.name || i.product_name} x ${i.quantity} - INR ${i.price}</li>`)
    .join("");
  return sendMail({
    to: userEmail,
    subject: `Order Confirmation - ${orderId}`,
    html: baseTemplate("Order Confirmed", `<p>Your order <strong>${orderId}</strong> has been placed.</p><p>Total: INR ${total}</p><ul>${list}</ul>`)
  });
}

export async function sendOrderStatusUpdate(userEmail, orderId, status, trackingLink) {
  return sendMail({
    to: userEmail,
    subject: `Order ${orderId} Update: ${status}`,
    html: baseTemplate("Order Status Updated", `<p>Order <strong>${orderId}</strong> status is now <strong>${status}</strong>.</p>${trackingLink ? `<p>Track: <a href="${trackingLink}">${trackingLink}</a></p>` : ""}`)
  });
}

export async function sendNewArrivalNotification(
  userEmail,
  userName,
  productName,
  productPrice,
  category,
  description,
  productId,
  productImage
) {
  const productUrl = `${env.frontendUrl.replace(/\/+$/, "")}/product/${productId}`;
  const shopUrl = env.frontendUrl;
  const imageUrl = productImage ? publicAssetUrl(productImage) : "";

  return sendMail({
    to: userEmail,
    subject: "New Product Added",
    html: baseTemplate(
      "New Arrival",
      `<p>Hi ${userName || "there"},</p>
       <p><strong>${productName}</strong> is now available in our catalog.</p>
       ${imageUrl ? `<p><img src="${imageUrl}" alt="${productName}" style="max-width:320px;width:100%;height:auto;border-radius:8px" /></p>` : ""}
       <p>Price: INR ${productPrice}</p>
       <p>Category: ${category}</p>
       <p>${description || ""}</p>
       <p><a href="${productUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:4px">View Product</a></p>
       <p><a href="${shopUrl}">Visit Website</a></p>`
    )
  });
}
