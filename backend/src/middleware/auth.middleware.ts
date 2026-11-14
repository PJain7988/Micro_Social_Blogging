
import mongoose, { Schema, Document } from "mongoose";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  familyId: mongoose.Types.ObjectId;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    familyId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  }
);

// Indexes

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ familyId: 1 });

refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Export model

const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
  );

export default RefreshToken;


export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const accessSecret = process.env.JWT_ACCESS_SECRET;

    if (!accessSecret) {
      throw new Error("JWT_ACCESS_SECRET is missing");
    }

    const decoded = jwt.verify(token, accessSecret);

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      (decoded.role !== "USER" && decoded.role !== "ADMIN")
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
      return;
    }

    req.user = {
      userId: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
