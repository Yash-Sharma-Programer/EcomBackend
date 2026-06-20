import { Router } from "express";
import * as menuController from "../controllers/menu.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const menuRouter = Router();

// Public: fetch the active menu for a location (header/footer)
menuRouter.get('/location/:location', menuController.getMenuByLocation);

// Admin
menuRouter.get('/', verifyToken, requireAdmin, menuController.getAllMenus);
menuRouter.get('/:id', verifyToken, requireAdmin, menuController.getMenuById);
menuRouter.post('/', verifyToken, requireAdmin, menuController.createMenu);
menuRouter.delete('/:id', verifyToken, requireAdmin, menuController.deleteMenu);

menuRouter.post('/:id/items', verifyToken, requireAdmin, menuController.addMenuItem);
menuRouter.put('/:id/items/:itemId', verifyToken, requireAdmin, menuController.updateMenuItem);
menuRouter.delete('/:id/items/:itemId', verifyToken, requireAdmin, menuController.deleteMenuItem);
menuRouter.patch('/:id/reorder', verifyToken, requireAdmin, menuController.reorderMenuItems);

export default menuRouter;
