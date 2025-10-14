import nodemailer from "nodemailer";
import crypto from "crypto";
import { ApiError } from "../Utils/apierrors.js";
import { Apiresponse } from "../Utils/apiresponse.js";

// Temporary OTP store
export const otpStore = new Map();

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json(new ApiError(400, "Email is required"));

  try {
    const otp = crypto.randomInt(100000, 999999);
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000, verified: false });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CodeWithMuaaz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(200).json(new Apiresponse(200, {}, "OTP sent successfully"));
  } catch (err) {
    console.error("OTP Send Error:", err);
    return res.status(500).json(new ApiError(500, "Failed to send OTP"));
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json(new ApiError(400, "Email and OTP are required"));

  const record = otpStore.get(email);
  if (!record) return res.status(400).json(new ApiError(400, "OTP not found or expired"));

  if (Date.now() > record.expires)
    return res.status(400).json(new ApiError(400, "OTP expired"));

  if (record.otp.toString() !== otp.toString())
    return res.status(400).json(new ApiError(400, "Invalid OTP"));

  // mark verified
  otpStore.set(email, { ...record, verified: true });

  return res.status(200).json(new Apiresponse(200, { verified: true }, "OTP verified successfully"));
};
