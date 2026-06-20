import { Router } from "express";
import * as siteSettingsController from "../controllers/siteSettings.controller.js";
import upload from "../middleware/upload.middleware.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const siteSettingsRouter = Router();

// Public
siteSettingsRouter.get('/', siteSettingsController.getSiteSettings);

// Admin
siteSettingsRouter.put('/', verifyToken, requireAdmin, siteSettingsController.updateSiteSettings);
siteSettingsRouter.put('/logo', verifyToken, requireAdmin, upload.single('logo'), siteSettingsController.updateLogo);
siteSettingsRouter.put('/favicon', verifyToken, requireAdmin, upload.single('favicon'), siteSettingsController.updateFavicon);
siteSettingsRouter.post('/banners', verifyToken, requireAdmin, upload.single('image'), siteSettingsController.addBanner);
siteSettingsRouter.delete('/banners/:bannerId', verifyToken, requireAdmin, siteSettingsController.deleteBanner);

export default siteSettingsRouter;
