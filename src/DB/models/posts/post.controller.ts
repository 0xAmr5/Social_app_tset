import {  Router } from "express";
import { fileUpload } from "../../../common/utils/middleware/multer";
import multerFileEnum from "../../../common/utils/enum/multerFileType";
import multerStorageEnum from "../../../common/utils/enum/multerStorageType";
import { validationMiddleWare } from "../../../common/utils/middleware/validation";
import { createPostSchema, emptyPostSchema, feedSchema, postIdSchema, profilePostsSchema, reactPostSchema, updatePostSchema } from "./post.schema";
import postServices from "./post.services";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";


const postController : Router = Router()

postController.use(authenticate)

postController.post('/create-post',
   fileUpload({fileType : multerFileEnum.image}).array('attachments'),
   validationMiddleWare(createPostSchema),
   postServices.createPost
)

postController.get("/feed", validationMiddleWare(feedSchema), postServices.getNewsFeed)
postController.get("/dashboard", authorize(["admin"]), validationMiddleWare(emptyPostSchema), postServices.getDashboardPosts)
postController.get("/profile", validationMiddleWare(profilePostsSchema), postServices.getProfilePosts)
postController.get("/profile/:userId", validationMiddleWare(profilePostsSchema), postServices.getProfilePosts)
postController.get("/:id", validationMiddleWare(postIdSchema), postServices.getPostById)
postController.patch("/:id", validationMiddleWare(updatePostSchema), postServices.updatePost)
postController.patch("/:id/react", validationMiddleWare(reactPostSchema), postServices.reactToPost)
postController.delete("/:id/soft", validationMiddleWare(postIdSchema), postServices.softDeletePost)
postController.delete("/:id/hard", authorize(["admin"]), validationMiddleWare(postIdSchema), postServices.hardDeletePost)


export default postController;
