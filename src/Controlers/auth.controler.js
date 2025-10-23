import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { user } from "../models/user.model.js"; 
import { ApiError } from "../Utils/apierrors.js";
import { Apiresponse } from "../Utils/apiresponse.js";

export const otpStore = new Map();

export const sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
 
    if (!email)
      return res.status(400).json(new ApiError(400, "Email is required"));

    const User = await user.findOne({ email });
    if (!User)
      return res.status(404).json(new ApiError(404, "User not found"));

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
          We received a request to reset your password for your <strong>CodeWithMuaaz</strong> account.  
          Please use the following One-Time Password (OTP) to proceed with resetting your password:
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
          If you did not request a password reset, please ignore this email — your account remains secure.
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


await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Password Reset OTP",
  html: htmlTemplate,
});

    return res.status(200).json(new Apiresponse(200, "OTP sent successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json(new ApiError(400, "Email and OTP are required"));

    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json(new ApiError(400, "No OTP found"));

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json(new ApiError(400, "OTP expired"));w
    }

    if (stored.otp !== otp)
      return res.status(400).json(new ApiError(400, "Invalid OTP"));

    otpStore.set(email, { ...stored, verified: true });

    return res.status(200).json(new Apiresponse(200, "OTP verified successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res
        .status(400)
        .json(new ApiError(400, "Email and new password required"));

    const stored = otpStore.get(email);
    if (!stored || !stored.verified)
      return res
        .status(400)
        .json(new ApiError(400, "OTP not verified or expired"));

    const User = await user.findOne({ email });
    if (!User)
      return res.status(404).json(new ApiError(404, "User not found"));

    
    User.password = newPassword;
    await User.save({ validateBeforeSave: false });
    otpStore.delete(email);

    return res
      .status(200)
      .json(new Apiresponse(200, "Password updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

