import { Router } from "express";
import * as pageController from "../controllers/page.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const pageRouter = Router();

// Public
pageRouter.get('/', pageController.getPublishedPages);
pageRouter.get('/slug/:slug', pageController.getPageBySlug);

// Admin
pageRouter.get('/admin/all', verifyToken, requireAdmin, pageController.getAllPages);
pageRouter.get('/admin/:id', verifyToken, requireAdmin, pageController.getPageById);
pageRouter.post('/', verifyToken, requireAdmin, pageController.createPage);
pageRouter.put('/:id', verifyToken, requireAdmin, pageController.updatePage);
pageRouter.delete('/:id', verifyToken, requireAdmin, pageController.deletePage);

export default pageRouter;
