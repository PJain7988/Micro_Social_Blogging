
import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  content?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;

  parentPostId?: mongoose.Types.ObjectId | null;
  rootPostId?: mongoose.Types.ObjectId | null;

  mentionedUserIds: mongoose.Types.ObjectId[];
  hashtags: string[];

  likeCount: number;
  repostCount: number;
  replyCount: number;

  moderationStatus:
    | "PENDING"
    | "APPROVED"
    | "FLAGGED"
    | "REJECTED";

  editedAt?: Date | null;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: false,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 280,
      default: null,
      required: function (this: IPost) {
        return !this.imageUrl;
      },
    },

    imageUrl: {
      type: String,
      default: null,
    },

    imagePublicId: {
      type: String,
      default: null,
    },

    parentPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    rootPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    mentionedUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    hashtags: {
      type: [
        {
          type: String,
          lowercase: true,
          trim: true,
          maxlength: 50,
        },
      ],
      default: [],
    },

    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    repostCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    moderationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "FLAGGED", "REJECTED"],
      default: "PENDING",
      required: true,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Post indexes

postSchema.index({
  authorId: 1,
  createdAt: -1,
  _id: -1,
});

postSchema.index({
  parentPostId: 1,
  createdAt: 1,
  _id: 1,
});

postSchema.index({
  rootPostId: 1,
});

postSchema.index({
  createdAt: -1,
  _id: -1,
});

postSchema.index({
  hashtags: 1,
  createdAt: -1,
});

postSchema.index({
  moderationStatus: 1,
  createdAt: -1,
});

// Export model

const Post =
  mongoose.models.Post ||
  mongoose.model<IPost>("Post", postSchema);

export default Post;
