import { Router } from "express";
import z from "zod";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { validationMiddleWare } from "../../common/middleware/validation";
import { genRules } from "../../common/utils/validationGeneralRules";
import notificationService from "./notification.service";

const notificationRouter = Router();
const emptySchema = {
  body: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
};
const idParamsSchema = { params: z.object({ id: genRules.id }) };
const notificationBodySchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  users: z.array(genRules.id).optional(),
  tokens: z.array(z.string().trim().min(1)).optional(),
  isGlobal: z.boolean().optional(),
});
const createNotificationSchema = { body: notificationBodySchema };
const updateNotificationSchema = {
  params: z.object({ id: genRules.id }),
  body: notificationBodySchema.partial().refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
};

notificationRouter.use(authenticate);
notificationRouter.get("/", validationMiddleWare(emptySchema), notificationService.listMine);
notificationRouter.patch("/:id/read", validationMiddleWare(idParamsSchema), notificationService.markAsRead);
notificationRouter.get("/dashboard", authorize(["admin"]), validationMiddleWare(emptySchema), notificationService.listDashboard);
notificationRouter.post("/", authorize(["admin"]), validationMiddleWare(createNotificationSchema), notificationService.create);
notificationRouter.patch("/:id", authorize(["admin"]), validationMiddleWare(updateNotificationSchema), notificationService.update);
notificationRouter.delete("/:id/soft", authorize(["admin"]), validationMiddleWare(idParamsSchema), notificationService.softDelete);
notificationRouter.delete("/:id/hard", authorize(["admin"]), validationMiddleWare(idParamsSchema), notificationService.hardDelete);

export default notificationRouter;
