
import mongoose, { Schema, Document } from "mongoose";

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
      minlength: 64,
      maxlength: 64,
      match: /^[a-f0-9]{64}$/,
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
    collection: "refreshTokens",
  }
);

// Index 1: Find all refresh tokens belonging to a user
refreshTokenSchema.index({ userId: 1 });

// Index 2: Find all tokens belonging to a session family
refreshTokenSchema.index({ familyId: 1 });

// Index 3: Automatically remove expired token records
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
