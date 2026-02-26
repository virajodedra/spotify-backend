import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js"; //auth controller import
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { validateUser } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/register", validateUser(registerSchema), registerUser);

router.post("/login", validateUser(loginSchema), loginUser);

router.post("/logout", logoutUser);

export default router;
