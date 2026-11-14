
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  emailNormalized: string;
  username: string;
  usernameNormalized: string;
  passwordHash: string;
  role: "USER" | "ADMIN";

  profile: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    isPrivate: boolean;
  };
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },

    emailNormalized: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    usernameNormalized: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    profile: {
      displayName: {
        type: String,
        required: true,
        maxlength: 50,
      },

      bio: {
        type: String,
        maxlength: 160,
        default: "",
      },

      avatarUrl: {
        type: String,
        default: "",
      },

      isPrivate: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;
