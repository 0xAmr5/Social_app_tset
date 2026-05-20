import mongoose from "mongoose";

export interface IStory {
  content?: string;
  media?: string[];
  createdBy: mongoose.Schema.Types.ObjectId;
  viewers?: mongoose.Schema.Types.ObjectId[];
  expiresAt: Date;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const storySchema = new mongoose.Schema<IStory>(
  {
    content: { type: String, trim: true },
    media: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

storySchema.pre("validate", function () {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
});

storySchema.pre(["find", "findOne"], function () {
  const { paranoid, ...rest } = this.getQuery();
  if (paranoid === true) {
    this.setQuery(rest);
  } else {
    this.setQuery({ deletedAt: null, expiresAt: { $gt: new Date() }, ...rest });
  }
});

const storyModel =
  ((mongoose.models.stories as mongoose.Model<IStory> | undefined) ||
    mongoose.model<IStory>("stories", storySchema)) as mongoose.Model<any>;

export default storyModel;
