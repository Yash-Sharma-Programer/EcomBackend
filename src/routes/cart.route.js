import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";

const cartRouter = Router()

// Cart is stored client-side (localStorage) — these routes exist for future server-side cart sync.
// Currently all cart operations are handled in the frontend context.

export default cartRouter
