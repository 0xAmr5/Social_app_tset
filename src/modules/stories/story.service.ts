import type { Request, Response, NextFunction } from "express";
import storyModel from "../../DB/models/story.model";
import { ErrorForbidden, ErrorNotFound, SuccessResponse } from "../../common/utils/global-error-handler";

const isOwner = (req: Request, createdBy: unknown) => String(createdBy) === String(req.user?.id);
const isAdmin = (req: Request) => req.user?.role === "admin";

class StoryService {
  create = async (req: Request, res: Response, _next: NextFunction) => {
    const media = Array.isArray(req.files) ? req.files.map((file) => file.path || file.originalname) : [];
    const story = await storyModel.create({
      content: req.body.content,
      media,
      createdBy: req.user?.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    SuccessResponse({ res, statusCode: 201, data: story });
  };

  listActive = async (_req: Request, res: Response, _next: NextFunction) => {
    const stories = await storyModel
      .find({})
      .sort({ createdAt: -1 })
      .populate("createdBy", "userName email")
      .lean();
    SuccessResponse({ res, data: stories });
  };

  view = async (req: Request, res: Response, _next: NextFunction) => {
    const story = await storyModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { viewers: req.user?.id } },
      { new: true },
    );
    if (!story) ErrorNotFound("story not found");
    SuccessResponse({ res, data: story });
  };

  softDelete = async (req: Request, res: Response, _next: NextFunction) => {
    const story = await storyModel.findById(req.params.id);
    if (!story) ErrorNotFound("story not found");
    if (!isOwner(req, story!.createdBy) && !isAdmin(req)) ErrorForbidden("you can delete your stories only");
    story!.deletedAt = new Date();
    await story!.save();
    SuccessResponse({ res, data: "story soft deleted" });
  };

  hardDelete = async (req: Request, res: Response, _next: NextFunction) => {
    const story = await storyModel.findOneAndDelete({ _id: req.params.id });
    if (!story) ErrorNotFound("story not found");
    SuccessResponse({ res, data: "story hard deleted" });
  };
}

export default new StoryService();
