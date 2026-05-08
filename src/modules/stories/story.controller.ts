import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { fileUpload } from "../../common/middleware/multer";
import multerFileEnum from "../../common/enum/multerFileType";
import storyService from "./story.service";

const storyRouter = Router();

storyRouter.use(authenticate);
storyRouter.post("/", fileUpload({ fileType: multerFileEnum.image }).array("media"), storyService.create);
storyRouter.get("/", storyService.listActive);
storyRouter.patch("/:id/view", storyService.view);
storyRouter.delete("/:id/soft", storyService.softDelete);
storyRouter.delete("/:id/hard", authorize(["admin"]), storyService.hardDelete);

export default storyRouter;
