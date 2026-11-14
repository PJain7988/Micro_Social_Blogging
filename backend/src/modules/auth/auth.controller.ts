
import { Request, Response, NextFunction } from "express";

import {
  registerUser,
  AuthServiceError,
  loginUser,
  refreshUserSession,
  logoutUser,
  logoutAllUserSessions
} from "./auth.service";

import { registerSchema, loginSchema } from "./auth.validation";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validate registration data
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Register user and generate tokens
    const result = await registerUser(validation.data);

    // 3. Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: result.refreshTokenExpiresAt,
      path: "/api/v1/auth",
    });

    // 4. Return successful response
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });

  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

//login part

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validate login data
    const validation = loginSchema.safeParse(req.body);
     if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await loginUser(validation.data);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: result.refreshTokenExpiresAt,
      path: "/api/v1/auth",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

//refresh part
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    const result = await refreshUserSession(refreshToken);

    // Replace the old cookie with the rotated refresh token
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: result.refreshTokenExpiresAt,
      path: "/api/v1/auth",
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });

  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
      });

      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

//logout part

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await logoutUser(refreshToken || "");

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    await logoutAllUserSessions(req.user.userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth"
    });

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully"
    });
  } catch (error) {
    next(error);
  }
};
