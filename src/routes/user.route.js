import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const userRouter = Router();

// Admin: user management
userRouter.get('/', verifyToken, requireAdmin, userController.getAllUsers);
userRouter.get('/:id', verifyToken, requireAdmin, userController.getUserById);
userRouter.patch('/:id/block', verifyToken, requireAdmin, userController.toggleBlockUser);
userRouter.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);

// Self-service: saved addresses
userRouter.post('/me/addresses', verifyToken, userController.addAddress);
userRouter.delete('/me/addresses/:addressId', verifyToken, userController.deleteAddress);

// Self-service: wishlist
userRouter.get('/me/wishlist', verifyToken, userController.getWishlist);
userRouter.post('/me/wishlist/toggle', verifyToken, userController.toggleWishlist);

export default userRouter;
