
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; //this import works when export is not default 

const router = Router()

router.route("/register").post(registerUser)
export default router