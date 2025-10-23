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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It will expire in 5 minutes.`,
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

