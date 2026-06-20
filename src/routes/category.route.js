import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import upload from "../middleware/upload.middleware.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const categoryRouter = Router();

// Public
categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/:id', categoryController.getCategoryById);
categoryRouter.get('/:id/products', categoryController.getCategoryProducts);

// Admin only
categoryRouter.post('/', verifyToken, requireAdmin, upload.single('image'), categoryController.createCategory);
categoryRouter.put('/:id', verifyToken, requireAdmin, upload.single('image'), categoryController.updateCategory);
categoryRouter.delete('/:id', verifyToken, requireAdmin, categoryController.deleteCategory);

export default categoryRouter;
