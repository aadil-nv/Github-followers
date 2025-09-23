import { Router } from "express";
import { IAuthController } from "../controllers/interfaces/auth.controller.interface";
import { container } from "../config/inversify.config";
import { validateRequest,registerSchema,loginSchema } from "../middlewares/validation.middleware";
const authRouter = Router();
const controller = container.get<IAuthController>("IAuthController");

authRouter.post("/register",validateRequest(registerSchema), controller.register.bind(controller));
authRouter.post("/login",validateRequest(loginSchema), controller.login.bind(controller));
authRouter.post("/refresh-token", controller.setNewAccessToken.bind(controller));
authRouter.post("/logout", controller.logout.bind(controller));

export default authRouter;
