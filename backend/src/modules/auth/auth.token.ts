import jwt, { SignOptions } from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import mongoose from "mongoose";

// Token configuration
const ACCESS_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] = "15m";

const REFRESH_TOKEN_TTL_MS =
  7 * 24 * 60 * 60 * 1000;

// Generate SHA-256 hash of refresh token
export const hashRefreshToken = (token: string): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

// Generate access and refresh tokens
export const generateAuthTokens = (
  userId: string,
  role: "USER" | "ADMIN",
  existingFamilyId?: mongoose.Types.ObjectId
) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;

  if (!accessSecret) {
    throw new Error("JWT_ACCESS_SECRET is missing");
  }

  // Generate JWT access token
  const accessToken = jwt.sign(
    { role },
    accessSecret,
    {
      subject: userId,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );

  // Generate secure random refresh token
  const refreshToken = randomBytes(64).toString("hex");

  // Hash refresh token before database storage
  const tokenHash = hashRefreshToken(refreshToken);

  // Reuse family ID during token rotation
  const familyId =
    existingFamilyId || new mongoose.Types.ObjectId();

  // Calculate refresh token expiry
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_MS
  );

  return {
    accessToken,
    refreshToken,
    tokenHash,
    familyId,
    expiresAt,
  };
};
