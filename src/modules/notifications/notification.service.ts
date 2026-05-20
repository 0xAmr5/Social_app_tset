import type { Request, Response, NextFunction } from "express";
import notificationModel from "../../DB/models/notification.model";
import { ErrorNotFound, SuccessResponse } from "../../common/utils/global-error-handler";
import fireBaseServices from "../../common/service/fireBase.services";

class NotificationService {
  sendNotification = async ({
    token,
    data,
  }: {
    token: string
    data: { title: string; body: string }
  }) => {
    return await fireBaseServices.sendNotification({ token, data })
  }

  sendNotifications = async ({ tokens, data }: { tokens: string[]; data?: { title: string; body: string } }) => {
    if (data) {
      await Promise.all(tokens.map(token => fireBaseServices.sendNotification({ token, data })))
      return
    }

    return await fireBaseServices.sendNotifications({ tokens })
  }

  create = async (req: Request, res: Response, _next: NextFunction) => {
    const notification = await notificationModel.create({
      title: req.body.title,
      body: req.body.body,
      users: req.body.users ?? [],
      isGlobal: Boolean(req.body.isGlobal),
      createdBy: req.user?.id,
    });

    const tokens = Array.isArray(req.body.tokens) ? req.body.tokens : [];
    if (tokens.length) {
      await fireBaseServices.sendNotifications({ tokens });
    }

    SuccessResponse({ res, statusCode: 201, data: notification });
  };

  listMine = async (req: Request, res: Response, _next: NextFunction) => {
    const notifications = await notificationModel
      .find({
        $or: [{ isGlobal: true }, { users: req.user?.id }],
      })
      .sort({ createdAt: -1 })
      .lean();
    SuccessResponse({ res, data: notifications });
  };

  listDashboard = async (req: Request, res: Response, _next: NextFunction) => {
    const notifications = await notificationModel.find({ paranoid: true }).sort({ createdAt: -1 }).lean();
    SuccessResponse({ res, data: notifications });
  };

  markAsRead = async (req: Request, res: Response, _next: NextFunction) => {
    const notification = await notificationModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user?.id } },
      { new: true },
    );
    if (!notification) ErrorNotFound("notification not found");
    SuccessResponse({ res, data: notification });
  };

  update = async (req: Request, res: Response, _next: NextFunction) => {
    const notification = await notificationModel.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        body: req.body.body,
        users: req.body.users,
        isGlobal: req.body.isGlobal,
      },
      { new: true, runValidators: true },
    );
    if (!notification) ErrorNotFound("notification not found");
    SuccessResponse({ res, data: notification });
  };

  softDelete = async (req: Request, res: Response, _next: NextFunction) => {
    const notification = await notificationModel.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true },
    );
    if (!notification) ErrorNotFound("notification not found");
    SuccessResponse({ res, data: "notification soft deleted" });
  };

  hardDelete = async (req: Request, res: Response, _next: NextFunction) => {
    const notification = await notificationModel.findByIdAndDelete(req.params.id);
    if (!notification) ErrorNotFound("notification not found");
    SuccessResponse({ res, data: "notification hard deleted" });
  };
}

export default new NotificationService();
