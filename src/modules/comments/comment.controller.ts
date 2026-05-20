import { Router } from "express";
import z from "zod";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { validationMiddleWare } from "../../common/middleware/validation";
import { genRules } from "../../common/utils/validationGeneralRules";
import commentService from "./comment.service";

const commentRouter = Router();
const idParamsSchema = { params: z.object({ id: genRules.id }) };
const postIdParamsSchema = { params: z.object({ postId: genRules.id }) };
const createCommentSchema = {
  body: z.object({
    postId: genRules.id,
    content: z.string().trim().min(1),
    parentComment: genRules.id.optional(),
  }),
};
const updateCommentSchema = {
  params: z.object({ id: genRules.id }),
  body: z.object({ content: z.string().trim().min(1) }),
};
const reactCommentSchema = {
  params: z.object({ id: genRules.id }),
  body: z.object({
    type: z.enum(["like", "love", "haha", "wow", "sad", "angry"]).optional(),
  }),
};

commentRouter.use(authenticate);
commentRouter.post("/", validationMiddleWare(createCommentSchema), commentService.create);
commentRouter.get("/post/:postId", validationMiddleWare(postIdParamsSchema), commentService.listByPost);
commentRouter.get("/:id", validationMiddleWare(idParamsSchema), commentService.getById);
commentRouter.patch("/:id", validationMiddleWare(updateCommentSchema), commentService.update);
commentRouter.patch("/:id/react", validationMiddleWare(reactCommentSchema), commentService.react);
commentRouter.delete("/:id/soft", validationMiddleWare(idParamsSchema), commentService.softDelete);
commentRouter.delete("/:id/hard", authorize(["admin"]), validationMiddleWare(idParamsSchema), commentService.hardDelete);

export default commentRouter;
