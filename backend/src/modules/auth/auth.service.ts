
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../../models/users";
import RefreshToken from "../../models/RefreshToken";

import { RegisterInput, LoginInput } from "./auth.validation";
import { generateAuthTokens, hashRefreshToken } from "./auth.token";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export const registerUser = async (input: RegisterInput) => {
  const emailNormalized = input.email.trim().toLowerCase();
  const usernameNormalized = input.username.trim().toLowerCase();

  // 1. Check duplicate email
  const existingEmail = await User.findOne({ emailNormalized });

  if (existingEmail) {
    throw new AuthServiceError("Email already registered", 409);
  }

  // 2. Check duplicate username
  const existingUsername = await User.findOne({ usernameNormalized });

  if (existingUsername) {
    throw new AuthServiceError("Username already taken", 409);
  }

  // 3. Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  const session = await mongoose.startSession();

  try {
    // 4. Create user and refresh token atomically
    const result = await session.withTransaction(async () => {
      const [user] = await User.create(
        [{
          email: emailNormalized,
          emailNormalized,
          username: input.username.trim(),
          usernameNormalized,
          passwordHash,
          role: "USER",
          profile: {
            displayName: input.displayName.trim(),
            bio: "",
            avatarUrl: "",
            isPrivate: false,
          },
        }],
        { session }
      );

      // 5. Generate tokens
      const tokens = generateAuthTokens(
        user._id.toString(),
        user.role
      );

      // 6. Store refresh token hash
      await RefreshToken.create(
        [{
          userId: user._id,
          tokenHash: tokens.tokenHash,
          familyId: tokens.familyId,
          expiresAt: tokens.expiresAt,
          revokedAt: null,
        }],
        { session }
      );

      return { user, tokens };
    });

    if (!result) {
      throw new Error("Registration transaction failed");
    }

    // 7. Remove sensitive information
    const userObject = result.user.toObject();

    const {
      passwordHash: _passwordHash,
      ...safeUser
    } = userObject;

    // 8. Return authentication data
    return {
      user: safeUser,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      refreshTokenExpiresAt: result.tokens.expiresAt,
    };

  } catch (error: unknown) {
    // Handle duplicate-key race conditions
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const duplicateError = error as {
        keyPattern?: Record<string, number>;
      };

      if (duplicateError.keyPattern?.emailNormalized) {
        throw new AuthServiceError("Email already registered", 409);
      }

      if (duplicateError.keyPattern?.usernameNormalized) {
        throw new AuthServiceError("Username already taken", 409);
      }

      throw new AuthServiceError("Account already exists", 409);
    }

    throw error;

  } finally {
    await session.endSession();
  }
};
// login part


export const loginUser = async (input: LoginInput) => {
  const identifier = input.identifier.trim().toLowerCase();

  // Find account using email or username
  const user = await User.findOne({
    $or: [
      { emailNormalized: identifier },
      { usernameNormalized: identifier },
    ],
  }).select("+passwordHash");

  // Generic error prevents account enumeration
  if (!user) {
    throw new AuthServiceError("Invalid email/username or password", 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AuthServiceError("Invalid email/username or password", 401);
  }

  // Generate authentication tokens
  const tokens = generateAuthTokens(
    user._id.toString(),
    user.role
  );

  // Save hashed refresh token
  await RefreshToken.create({
    userId: user._id,
    tokenHash: tokens.tokenHash,
    familyId: tokens.familyId,
    expiresAt: tokens.expiresAt,
    revokedAt: null,
  });

  // Remove password hash from response
  const userObject = user.toObject();
  const { passwordHash: _passwordHash, ...safeUser } = userObject;

  return {
    user: safeUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.expiresAt,
  };
};

// Refersh user part
export const refreshUserSession = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AuthServiceError("Refresh token is required", 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const storedToken = await RefreshToken.findOne({
        tokenHash,
      }).session(session);

      if (!storedToken) {
        return { status: "INVALID" as const };
      }

      // Detect reuse of an already revoked token
      if (storedToken.revokedAt) {
        await RefreshToken.updateMany(
          {
            familyId: storedToken.familyId,
            revokedAt: null,
          },
          {
            $set: { revokedAt: new Date() },
          },
          { session }
        );

        return { status: "REUSED" as const };
      }

      // Check token expiration
      if (storedToken.expiresAt <= new Date()) {
        return { status: "EXPIRED" as const };
      }

      // Revoke the old token
      const revoked = await RefreshToken.updateOne(
        {
          _id: storedToken._id,
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        },
        {
          $set: { revokedAt: new Date() },
        },
        { session }
      );

      if (revoked.modifiedCount !== 1) {
        return { status: "INVALID" as const };
      }

      // Generate new tokens using the same token family
      const user = await User.findById(storedToken.userId)
        .session(session);

      if (!user) {
        return { status: "INVALID" as const };
      }

      const tokens = generateAuthTokens(
        user._id.toString(),
        user.role,
        storedToken.familyId
      );

      // Store the new refresh token hash
      await RefreshToken.create(
        [{
          userId: user._id,
          tokenHash: tokens.tokenHash,
          familyId: tokens.familyId,
          expiresAt: tokens.expiresAt,
          revokedAt: null,
        }],
        { session }
      );

      return {
        status: "SUCCESS" as const,
        user,
        tokens,
      };
    });

    if (!result || result.status === "INVALID") {
      throw new AuthServiceError("Invalid refresh token", 401);
    }

    if (result.status === "EXPIRED") {
      throw new AuthServiceError("Refresh token expired", 401);
    }

    if (result.status === "REUSED") {
      throw new AuthServiceError(
        "Refresh token reuse detected. Please log in again.",
        401
      );
    }

    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      refreshTokenExpiresAt: result.tokens.expiresAt,
    };

  } finally {
    await session.endSession();
  }
};

//logout part


export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await RefreshToken.updateOne(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};

export const logoutAllUserSessions = async (userId: string) => {
  await RefreshToken.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};
