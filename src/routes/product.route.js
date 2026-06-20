import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import upload from "../middleware/upload.middleware.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const productRouter = Router();

// Public
productRouter.get('/', productController.getProducts);
productRouter.get('/:id', productController.getProductById);

// Admin only
productRouter.post('/', verifyToken, requireAdmin, upload.array('images', 6), productController.createProduct);
productRouter.put('/:id', verifyToken, requireAdmin, upload.array('images', 6), productController.updateProduct);
productRouter.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

export default productRouter;
