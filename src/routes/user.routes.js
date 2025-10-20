import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../Controlers/user.constrolers.js";
import { sendOtp, verifyOtp } from "../Controlers/otp.controler.js";
import { upload } from "../Middlewears/multer.middlewear.js";
import { verifyJWT } from "../Middlewears/auth.middlewear.js";

const router = Router();

// OTP verification routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Register route (after OTP verification)
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);


router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
