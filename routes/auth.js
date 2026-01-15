import express from "express"
import { signIn,signUp } from "../controllers/authController.js"
import { authMiddleware } from "../middleware/authMiddleWare.js"

const userRouter = express.Router()

userRouter.post('/signup',signUp)
userRouter.post('/signin',authMiddleware,signIn)


export default userRouter