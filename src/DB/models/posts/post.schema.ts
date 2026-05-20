import z from "zod";
import availabiltyEnum from "../../../common/utils/enum/availablity.enum";
import allowCommentsEnum from "../../../common/utils/enum/allowComments.enum";
import { genRules } from "../../../common/utils/validationGeneralRules";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      attachments: z.array(genRules.file).optional(),
      tags: z.array(genRules.id).default([]),
      allowComments: z.enum(allowCommentsEnum).default(allowCommentsEnum.allow),
      availablity: z.enum(availabiltyEnum).default(availabiltyEnum.freinds),
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data?.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "you can not create an empty post",
        });
      }

      if ( data.tags.length !== new Set(data.tags).size){
         ctx.addIssue({
            code: "custom",
          path: ["content"],
          message: "Duplicated tags",
         })
      }
    }),
};

export const emptyPostSchema = {
  body: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
};

export const postIdSchema = {
  params: z.object({
    id: genRules.id,
  }),
};

export const profilePostsSchema = {
  params: z.object({
    userId: genRules.id.optional(),
  }).optional(),
};

export const feedSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
};

export const updatePostSchema = {
  params: z.object({
    id: genRules.id,
  }),
  body: z.object({
    content: z.string().optional(),
    tags: z.array(genRules.id).optional(),
    allowComments: z.enum(allowCommentsEnum).optional(),
    availablity: z.enum(availabiltyEnum).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
};

export const reactPostSchema = {
  params: z.object({
    id: genRules.id,
  }),
  body: z.object({
    type: z.enum(["like", "love", "haha", "wow", "sad", "angry"]).optional(),
  }),
};
