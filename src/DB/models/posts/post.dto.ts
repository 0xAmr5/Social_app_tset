import z from "zod";
import { createPostSchema } from "./post.schema.js";

export type createPostDTO = z.infer<typeof createPostSchema.body>;