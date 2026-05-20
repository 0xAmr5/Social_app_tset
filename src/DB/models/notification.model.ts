import mongoose from "mongoose";

export interface INotification {
  title: string;
  body: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  users?: mongoose.Schema.Types.ObjectId[];
  isGlobal: boolean;
  readBy?: mongoose.Schema.Types.ObjectId[];
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGlobal: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.pre(["find", "findOne"], function () {
  const { paranoid, ...rest } = this.getQuery();
  this.setQuery(paranoid === true ? rest : { deletedAt: null, ...rest });
});

const notificationModel =
  ((mongoose.models.notifications as mongoose.Model<INotification> | undefined) ||
    mongoose.model<INotification>("notifications", notificationSchema)) as mongoose.Model<any>;

export default notificationModel;
