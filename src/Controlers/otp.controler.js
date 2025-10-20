import nodemailer from "nodemailer";
import crypto from "crypto";
import { ApiError } from "../Utils/apierrors.js";
import { Apiresponse } from "../Utils/apiresponse.js";

// Temporary in-memory OTP store
export const otpStore = new Map();

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json(new ApiError(400, "Email is required"));

  try {
    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);

    // Store OTP with expiry (5 minutes)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      verified: false,
    });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email template (HTML)
    const htmlTemplate = `
      <div style="
        background-color: #f3f6fa;
        padding: 40px 20px;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #333;
      ">
        <div style="
          max-width: 550px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin: 0 auto;
          overflow: hidden;
        ">
          <div style="background-color: #0078ff; padding: 20px 0; text-align: center;">
            <h1 style="color: #fff; font-size: 26px; margin: 0;">Code With Muaaz</h1>
          </div>

          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; margin-bottom: 10px;">Assalam-o-Alaikum 👋,</p>
            <p style="font-size: 15px; margin-bottom: 25px;">
              Thank you for reaching out to <strong>CodeWithMuaaz</strong>!  
              Please use the following One-Time Password (OTP) to verify your account:
            </p>

            <div style="
              background-color: #0078ff;
              color: #ffffff;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              padding: 12px 0;
              border-radius: 8px;
              letter-spacing: 3px;
              margin-bottom: 25px;
            ">
              ${otp}
            </div>

            <p style="font-size: 14px; color: #555;">
              ⚠️ This OTP will expire in <strong>5 minutes</strong>.  
              Please do not share it with anyone for security reasons.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

            <div style="text-align: center; font-size: 13px; color: #777;">
              <p style="margin-bottom: 4px;">Kind Regards,</p>
              <p style="font-weight: 600; color: #0078ff;">Muhammad Muaaz Ali</p>
              <p>Code With Muaaz</p>
              <a href="https://codewithmuaaz.online" 
                style="color:#0078ff; text-decoration:none; font-size: 13px;">
                🌐 codewithmuaaz.online
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"Muhammad Muaaz Ali | Code With Muaaz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your Verification Code - Code With Muaaz",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: htmlTemplate,
    });

    return res
      .status(200)
      .json(new Apiresponse(200, {}, "OTP sent successfully ✅"));
  } catch (err) {
    console.error("OTP Send Error:", err);
    return res.status(500).json(new ApiError(500, "Failed to send OTP ❌"));
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res
      .status(400)
      .json(new ApiError(400, "Email and OTP are required"));

  const record = otpStore.get(email);
  if (!record)
    return res
      .status(400)
      .json(new ApiError(400, "OTP not found or expired"));

  if (Date.now() > record.expires)
    return res.status(400).json(new ApiError(400, "OTP expired"));

  if (record.otp.toString() !== otp.toString())
    return res.status(400).json(new ApiError(400, "Invalid OTP"));

  otpStore.set(email, { ...record, verified: true });

  return res
    .status(200)
    .json(
      new Apiresponse(200, { verified: true }, "OTP verified successfully ✅")
    );
};
