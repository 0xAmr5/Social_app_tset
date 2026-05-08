import {  Router } from "express";
import { fileUpload } from "../../../common/utils/middleware/multer";
import multerFileEnum from "../../../common/utils/enum/multerFileType";
import multerStorageEnum from "../../../common/utils/enum/multerStorageType";
import { validationMiddleWare } from "../../../common/utils/middleware/validation";
import { createPostSchema } from "./post.schema";
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

postController.get("/feed", postServices.getNewsFeed)
postController.get("/dashboard", authorize(["admin"]), postServices.getDashboardPosts)
postController.get("/profile", postServices.getProfilePosts)
postController.get("/profile/:userId", postServices.getProfilePosts)
postController.get("/:id", postServices.getPostById)
postController.patch("/:id", postServices.updatePost)
postController.patch("/:id/react", postServices.reactToPost)
postController.delete("/:id/soft", postServices.softDeletePost)
postController.delete("/:id/hard", authorize(["admin"]), postServices.hardDeletePost)


export default postController;
