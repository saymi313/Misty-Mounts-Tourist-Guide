const nodemailer = require("nodemailer");
require("dotenv").config();

// Brevo SMTP transport (credentials in .env: EMAIL_HOST/PORT/SECURE/USER/PASS).
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const FROM = `"Misty Mounts" <${process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER}>`;

const COPY = {
  verify: {
    eyebrow: "Verify your email",
    title: (n) => `Welcome${n ? `, ${n}` : ""} &#128075;`,
    body: "Use the code below to finish creating your Misty Mounts account and start exploring Hazara.",
    subject: (otp) => `${otp} is your Misty Mounts verification code`,
  },
  reset: {
    eyebrow: "Reset your password",
    title: (n) => `Hi${n ? ` ${n}` : ""} &#128272;`,
    body: "Use the code below to reset your Misty Mounts password. If you didn't request this, you can safely ignore this email.",
    subject: (otp) => `${otp} is your Misty Mounts password reset code`,
  },
};

/** Premium dark "night + lime" OTP email (table-based, inline styles for email clients). */
const otpEmailHtml = (name, otp, purpose = "verify") => {
  const copy = COPY[purpose] || COPY.verify;
  const digits = String(otp)
    .split("")
    .map(
      (d) =>
        `<td style="width:44px;height:56px;background:#111813;border:1px solid rgba(163,230,53,0.25);border-radius:12px;text-align:center;vertical-align:middle;font-family:'Courier New',monospace;font-size:28px;font-weight:700;color:#a3e635;">${d}</td>`
    )
    .join(`<td style="width:8px;">&nbsp;</td>`);

  return `
  <div style="margin:0;padding:0;background:#070b08;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b08;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0d130f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;">
          <!-- Header -->
          <tr><td style="padding:32px 32px 8px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:40px;height:40px;background:#a3e635;border-radius:12px;text-align:center;vertical-align:middle;font-size:20px;">⛰️</td>
              <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#ffffff;">Misty<span style="color:#a3e635;">Mounts</span></td>
            </tr></table>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:16px 32px 8px 32px;">
            <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#a3e635;">${copy.eyebrow}</p>
            <h1 style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.2;font-weight:800;color:#ffffff;">${copy.title(name)}</h1>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.65);">${copy.body}</p>
          </td></tr>
          <!-- Code -->
          <tr><td style="padding:24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>${digits}</tr></table>
            <p style="margin:18px 0 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.4);">This code expires in <strong style="color:rgba(255,255,255,0.7);">10 minutes</strong>.</p>
          </td></tr>
          <!-- Divider + footnote -->
          <tr><td style="padding:8px 32px 28px 32px;">
            <div style="height:1px;background:rgba(255,255,255,0.08);margin-bottom:18px;"></div>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.4);">Didn't request this? You can safely ignore this email — no account will be created without the code.</p>
          </td></tr>
        </table>
        <p style="margin:20px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.3);">Misty Mounts · Hazara, Pakistan</p>
      </td></tr>
    </table>
  </div>`;
};

const sendOtpEmail = async (to, name, otp, purpose = "verify") => {
  const copy = COPY[purpose] || COPY.verify;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: copy.subject(otp),
    text: `Your Misty Mounts code is ${otp}. It expires in 10 minutes.`,
    html: otpEmailHtml(name, otp, purpose),
  });
};

/** Escape user-supplied text before dropping it into the HTML email body. */
const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Branded "night + lime" reply email — an admin's answer to a contact query. */
const replyEmailHtml = (name, reply, original) => `
  <div style="margin:0;padding:0;background:#070b08;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b08;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d130f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;">
          <!-- Header -->
          <tr><td style="padding:32px 32px 8px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:40px;height:40px;background:#a3e635;border-radius:12px;text-align:center;vertical-align:middle;font-size:20px;">⛰️</td>
              <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#ffffff;">Misty<span style="color:#a3e635;">Mounts</span></td>
            </tr></table>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:16px 32px 8px 32px;">
            <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#a3e635;">Reply from our team</p>
            <h1 style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;font-weight:800;color:#ffffff;">Hi${name ? ` ${esc(name)}` : ""} &#128075;</h1>
            <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.65);">Thanks for reaching out to Misty Mounts. Here's our response to your message:</p>
            <div style="background:#111813;border:1px solid rgba(163,230,53,0.25);border-radius:16px;padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#eef2f0;white-space:pre-wrap;">${esc(reply)}</div>
          </td></tr>
          ${
            original
              ? `<!-- Original message -->
          <tr><td style="padding:16px 32px 8px 32px;">
            <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.4);">Your original message</p>
            <div style="border-left:2px solid rgba(255,255,255,0.12);padding-left:14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.5);white-space:pre-wrap;">${esc(original)}</div>
          </td></tr>`
              : ""
          }
          <!-- Divider + footnote -->
          <tr><td style="padding:20px 32px 28px 32px;">
            <div style="height:1px;background:rgba(255,255,255,0.08);margin-bottom:18px;"></div>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.4);">You can reply directly to this email if you have more questions — we're happy to help.</p>
          </td></tr>
        </table>
        <p style="margin:20px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.3);">Misty Mounts · Hazara, Pakistan</p>
      </td></tr>
    </table>
  </div>`;

/** Send an admin's reply to a traveller's contact-form message. */
const sendReplyEmail = async (to, name, reply, original = "") => {
  await transporter.sendMail({
    from: FROM,
    to,
    replyTo: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER,
    subject: "Re: Your message to Misty Mounts",
    text: `Hi${name ? ` ${name}` : ""},\n\n${reply}\n\n— The Misty Mounts Team`,
    html: replyEmailHtml(name, reply, original),
  });
};

module.exports = { transporter, sendOtpEmail, sendReplyEmail };
