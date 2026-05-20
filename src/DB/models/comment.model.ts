import mongoose from "mongoose";

export interface IComment {
  content: string;
  post: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  parentComment?: mongoose.Schema.Types.ObjectId;
  reactions?: {
    user: mongoose.Schema.Types.ObjectId;
    type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  }[];
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: { type: String, required: true, trim: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "posts", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "comments" },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
          type: String,
          enum: ["like", "love", "haha", "wow", "sad", "angry"],
          default: "like",
        },
      },
    ],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

commentSchema.pre(["find", "findOne"], function () {
  const { paranoid, ...rest } = this.getQuery();
  if (paranoid === true) {
    this.setQuery(rest);
  } else {
    this.setQuery({ deletedAt: null, ...rest });
  }
});

commentSchema.pre("findOneAndDelete", async function () {
  const comment = await this.model.findOne(this.getQuery()).lean();
  if (!comment?._id) return;
  await this.model.deleteMany({ parentComment: comment._id });
});

const commentModel =
  ((mongoose.models.comments as mongoose.Model<IComment> | undefined) ||
    mongoose.model<IComment>("comments", commentSchema)) as mongoose.Model<any>;

export default commentModel;
