import nodemailer from "nodemailer";
import { env } from "./env.js";

let transporter = null;

if (env.mailHost && env.mailUser && env.mailPass) {
  transporter = nodemailer.createTransport({
    host: env.mailHost,
    port: env.mailPort,
    secure: env.mailSecure,
    auth: {
      user: env.mailUser,
      pass: env.mailPass
    }
  });
} else {
  console.warn("Mailer is disabled: missing MAIL_SERVER / MAIL_USERNAME / MAIL_PASSWORD");
}

export async function sendMail({ to, subject, html }) {
  if (!transporter) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: env.mailFrom,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("Mail send failed:", error.message);
    return false;
  }
}
