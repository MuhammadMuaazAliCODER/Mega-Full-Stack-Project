import {Router} from 'express';
import { loginUser, logoutUser, registerUser } from '../Controlers/user.constrolers.js';
import {upload} from '../Middlewears/multer.middlewear.js'
import { verifyJWT } from '../Middlewears/auth.middlewear.js';
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "Avatar",
            maxCount:1,

        }
        ,
        {
            name : "CoverImgae",
            maxCount:1,
        }
    ]),
    registerUser

)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT , logoutUser)
export default router;

export const abc = () => console.log("abc Hello World");