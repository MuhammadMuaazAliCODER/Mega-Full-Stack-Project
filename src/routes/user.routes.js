import {Router} from 'express';
import { registerUser } from '../Controlers/user.constrolers.js';

const router = Router()

router.route("/register").post(registerUser)

export default router;

export const abc = () => console.log("abc Hello World");

