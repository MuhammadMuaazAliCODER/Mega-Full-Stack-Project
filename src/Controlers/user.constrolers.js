import { asynHandler } from "../Utils/asynHandler.js";
import { ApiError } from "../Utils/apierrors.js";
import { user } from "../models/user.model.js";
import { uploadUserImages } from "../Validations/uploader_check.validation.js";
import { Apiresponse } from "../Utils/apiresponse.js";
import { otpStore } from "./otp.controler.js"; // ✅ Import OTP store for email verification

// -----------------------------
// Generate Access + Refresh Tokens
// -----------------------------
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const User = await user.findById(userId);
    if (!User) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();

    User.RefreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  }
};

// -----------------------------
// Register User (With OTP Check)
// -----------------------------
const registerUser = asynHandler(async (req, res) => {
  const { FullName, email, userName, password } = req.body;

  // ✅ Step 1: Basic validation
  if (![FullName, email, userName, password].every(Boolean)) {
    return res
      .status(400)
      .json(new ApiError(400, "FullName, email, userName, and password are required."));
  }

  // ✅ Step 2: Check OTP verification
  const verifiedRecord = otpStore.get(email);
  if (!verifiedRecord || !verifiedRecord.verified) {
    return res.status(401).json(new ApiError(401, "Email not verified. Please verify OTP first."));
  }

  // ✅ Step 3: Check for existing user
  const existedUser = await user.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    return res
      .status(409)
      .json(new ApiError(409, "User with this email or username already exists."));
  }

  // ✅ Step 4: Upload avatar and cover images
  const { avatarUrl, coverImageUrl } = await uploadUserImages(req, res);

  // ✅ Step 5: Create user
  const newUser = await user.create({
    FullName,
    Avatar: avatarUrl,
    CoverImage: coverImageUrl || "",
    email,
    password,
    userName: userName.toLowerCase(),
    isVerified: true, // ✅ Mark as verified since OTP was confirmed
  });

  const createdUser = await user
    .findById(newUser._id)
    .select("-password -RefreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  // ✅ Step 6: Remove OTP record after successful registration
  otpStore.delete(email);

  return res
    .status(201)
    .json(new Apiresponse(201, createdUser, "User registered successfully"));
});

// -----------------------------
// Login User
// -----------------------------
const loginUser = asynHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if ((!email && !userName) || !password) {
    throw new ApiError(400, "Either email or username and password are required.");
  }

  const existedUser = await user.findOne({
    $or: [{ userName }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User with this email or username does not exist.");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

  const loggedInUser = await user
    .findById(existedUser._id)
    .select("-password -RefreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// -----------------------------
// Logout User
// -----------------------------
const logoutUser = asynHandler(async (req, res) => {
  await user.findByIdAndUpdate(
    req.user._id,
    { $set: { RefreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User logged out successfully"));
});

// -----------------------------
// Export Controllers
// -----------------------------
export { registerUser, loginUser, logoutUser };
