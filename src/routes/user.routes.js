import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  RefreshAccessToken,
} from "../Controlers/user.constrolers.js";
import {
  sendOtp,
  verifyOtp,
 
} from "../Controlers/otp.controler.js";
import{
   sendPasswordResetOtp,
  verifyPasswordResetOtp,
  updatePassword,
} from "../Controlers/auth.controler.js";
import { upload } from "../Middlewears/multer.middlewear.js";
import { verifyJWT } from "../Middlewears/auth.middlewear.js";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post(
  "/register",
  upload.fields([
    { name: "Avatar", maxCount: 1 },
    { name: "CoverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", RefreshAccessToken);
router.post("/send-password-otp", sendPasswordResetOtp);
router.post("/verify-password-otp", verifyPasswordResetOtp);
router.patch("/update-password", updatePassword);

export default router;
