import { Router } from "express";
import z from "zod";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { fileUpload } from "../../common/middleware/multer";
import multerFileEnum from "../../common/enum/multerFileType";
import { validationMiddleWare } from "../../common/middleware/validation";
import { genRules } from "../../common/utils/validationGeneralRules";
import storyService from "./story.service";

const storyRouter = Router();
const emptySchema = {
  body: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
};
const idParamsSchema = { params: z.object({ id: genRules.id }) };
const createStorySchema = {
  body: z.object({
    content: z.string().trim().optional(),
    media: z.array(genRules.file).optional(),
  }).refine(data => Boolean(data.content) || Boolean(data.media?.length), {
    message: "Story content or media is required",
  }),
};

storyRouter.use(authenticate);
storyRouter.post("/", fileUpload({ fileType: multerFileEnum.image }).array("media"), validationMiddleWare(createStorySchema), storyService.create);
storyRouter.get("/", validationMiddleWare(emptySchema), storyService.listActive);
storyRouter.patch("/:id/view", validationMiddleWare(idParamsSchema), storyService.view);
storyRouter.delete("/:id/soft", validationMiddleWare(idParamsSchema), storyService.softDelete);
storyRouter.delete("/:id/hard", authorize(["admin"]), validationMiddleWare(idParamsSchema), storyService.hardDelete);

export default storyRouter;
