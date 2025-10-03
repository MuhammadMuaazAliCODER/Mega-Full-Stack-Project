import {Router} from 'express';
import { registerUser } from '../Controlers/user.constrolers.js';
import {upload} from '../Middlewears/multer.middlewear.js'
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


export default router;

export const abc = () => console.log("abc Hello World");