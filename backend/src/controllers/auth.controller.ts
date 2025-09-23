import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { LoginDTO } from "../dtos/login.dto";
import { RegisterDTO } from "../dtos/register.dto";
import { LoginResponseDTO } from "../dtos/login-response.dto";
import { HttpStatusCode } from "../constants/http-status-code.enum";
import { IAuthService } from "../services/interfaces/auth.service.interface";
import { config } from "../config/env";
import { IAuthController } from "./interfaces/auth.controller.interface";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject("IAuthService") private authService: IAuthService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as RegisterDTO;
      
      const { accessToken, refreshToken, user } = await this.authService.register(dto);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(config.ACCESS_TOKEN_MAX_AGE) 
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(config.REFRESH_TOKEN_MAX_AGE)
      });

      res.status(HttpStatusCode.CREATED).json({ user });
    } catch (err: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: err.message || "Registration failed" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as LoginDTO;
      const { accessToken, refreshToken, user } = await this.authService.login(dto.email, dto.password);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(config.ACCESS_TOKEN_MAX_AGE)
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(config.REFRESH_TOKEN_MAX_AGE)
      });

      const response: LoginResponseDTO = { user };
      res.status(HttpStatusCode.OK).json(response);
    } catch (err: any) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({ message: err.message || "Unauthorized" });
    }
  }

  async setNewAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken; 
      if (!refreshToken || !req.cookies.refreshToken) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Refresh token required" });
        return;
      }

      const { accessToken } = await this.authService.refreshAccessToken(refreshToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(config.ACCESS_TOKEN_MAX_AGE)
      });

      res.status(HttpStatusCode.OK).json({ message: "Access token refreshed" });
    } catch (err: any) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({ message: err.message || "Invalid refresh token" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken; 
      if (!refreshToken) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Refresh token required" });
        return;
      }
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(HttpStatusCode.OK).json({ message: "Logged out successfully" });
    } catch (err: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: err.message || "Logout failed" });
    }
  }
}
