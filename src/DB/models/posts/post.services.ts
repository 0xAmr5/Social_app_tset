import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import postModel, { ReactionType } from "../post.model";
import { ErrorForbidden, ErrorNotFound, SuccessResponse } from "../../../common/utils/global-error-handler";
import availabiltyEnum from "../../../common/utils/enum/availablity.enum";

const isOwner = (req: Request, createdBy: unknown) => String(createdBy) === String(req.user?.id);
const isAdmin = (req: Request) => req.user?.role === "admin";

class postServices {
  createPost = async (req: Request, res: Response, _next: NextFunction) => {
    const { availablity, content, tags = [], allowComments } = req.body;
    const attachments = Array.isArray(req.files)
      ? req.files.map((file) => file.path || file.originalname)
      : [];

    const post = await postModel.create({
      content,
      availablity,
      tags,
      attachments,
      allowComments,
      createdBy: req.user?.id,
    });

    SuccessResponse({ res, statusCode: 201, data: post });
  };

  getNewsFeed = async (req: Request, res: Response, _next: NextFunction) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
    const userId = req.user?.id;
    const friends = req.user?.friends ?? [];

    const posts = await postModel
      .find({
        $or: [
          { availablity: availabiltyEnum.public },
          { createdBy: userId },
          { tags: userId },
          { availablity: availabiltyEnum.freinds, createdBy: { $in: friends } },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "userName email role")
      .lean();

    SuccessResponse({ res, data: posts });
  };

  getDashboardPosts = async (req: Request, res: Response, _next: NextFunction) => {
    const posts = await postModel
      .find({ paranoid: true })
      .sort({ createdAt: -1 })
      .populate("createdBy", "userName email role")
      .lean();
    SuccessResponse({ res, data: posts });
  };

  getProfilePosts = async (req: Request, res: Response, _next: NextFunction) => {
    const ownerId = req.params.userId || req.user?.id;
    const posts = await postModel
      .find({
        createdBy: ownerId,
        $or: [
          { availablity: availabiltyEnum.public },
          { createdBy: req.user?.id },
          { tags: req.user?.id },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();
    SuccessResponse({ res, data: posts });
  };

  getPostById = async (req: Request, res: Response, _next: NextFunction) => {
    const post = await postModel.findById(req.params.id).populate("createdBy", "userName email role").lean();
    if (!post) ErrorNotFound("post not found");
    SuccessResponse({ res, data: post });
  };

  updatePost = async (req: Request, res: Response, _next: NextFunction) => {
    const post = await postModel.findById(req.params.id);
    if (!post) ErrorNotFound("post not found");
    if (!isOwner(req, post!.createdBy) && !isAdmin(req)) ErrorForbidden("you can update your posts only");

    const allowed = ["content", "availablity", "allowComments", "tags"] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (post as any)[key] = req.body[key];
      }
    }
    await post!.save();
    SuccessResponse({ res, data: post });
  };

  reactToPost = async (req: Request, res: Response, _next: NextFunction) => {
    const { type = "like" } = req.body as { type?: ReactionType };
    const valid: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];
    const reactionType = valid.includes(type) ? type : "like";
    const post = await postModel.findById(req.params.id);
    if (!post) ErrorNotFound("post not found");

    post!.reactions = (post!.reactions ?? []).filter((reaction: any) => String(reaction.user) !== String(req.user?.id));
    post!.reactions.push({ user: new Types.ObjectId(req.user?.id), type: reactionType } as any);
    await post!.save();
    SuccessResponse({ res, data: post });
  };

  softDeletePost = async (req: Request, res: Response, _next: NextFunction) => {
    const post = await postModel.findById(req.params.id);
    if (!post) ErrorNotFound("post not found");
    if (!isOwner(req, post!.createdBy) && !isAdmin(req)) ErrorForbidden("you can delete your posts only");
    post!.deletedAt = new Date();
    await post!.save();
    SuccessResponse({ res, data: "post soft deleted" });
  };

  hardDeletePost = async (req: Request, res: Response, _next: NextFunction) => {
    const post = await postModel.findOneAndDelete({ _id: req.params.id });
    if (!post) ErrorNotFound("post not found");
    SuccessResponse({ res, data: "post hard deleted" });
  };
}

export default new postServices();
