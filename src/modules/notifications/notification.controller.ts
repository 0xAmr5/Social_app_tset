import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import notificationService from "./notification.service";

const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", notificationService.listMine);
notificationRouter.patch("/:id/read", notificationService.markAsRead);
notificationRouter.get("/dashboard", authorize(["admin"]), notificationService.listDashboard);
notificationRouter.post("/", authorize(["admin"]), notificationService.create);
notificationRouter.patch("/:id", authorize(["admin"]), notificationService.update);
notificationRouter.delete("/:id/soft", authorize(["admin"]), notificationService.softDelete);
notificationRouter.delete("/:id/hard", authorize(["admin"]), notificationService.hardDelete);

export default notificationRouter;
