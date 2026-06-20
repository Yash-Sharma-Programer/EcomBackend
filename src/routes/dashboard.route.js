import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get('/', verifyToken, requireAdmin, getDashboardStats);

export default dashboardRouter;
