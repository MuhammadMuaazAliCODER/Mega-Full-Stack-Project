import dotenv from "dotenv";
dotenv.config(); 

import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    FullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    Avatar: {
      type: String, // Cloudinary URL
      required: true,
    },

    CoverImage: {
      type: String, // Cloudinary URL
    },

    WatchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    RefreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      userName: this.userName,
      FullName: this.FullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
};


userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "10d",
    }
  );
};

export const user = mongoose.model("User", userSchema);
