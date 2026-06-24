import { Router } from "express";
import * as authController from '../controllers/auth.controller.js'
import { verifyToken } from "../middleware/auth.middleware.js";

const authRouter = Router()

authRouter.post('/signin', authController.register)
authRouter.post('/login', authController.loginHandler)
authRouter.post('/adminlogin', authController.adminloginHandler)
authRouter.post('/logout', authController.logout)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/reset-password/:token', authController.resetPassword)
authRouter.put('/change-password', verifyToken, authController.changePassword)

authRouter.get('/profile', verifyToken, authController.getProfile)
authRouter.put('/profile', verifyToken, authController.updateProfile)

authRouter.get('/', (req, res) => {
    res.status(200).json({ message: "Backend Successfully Running" })
})

export default authRouter
