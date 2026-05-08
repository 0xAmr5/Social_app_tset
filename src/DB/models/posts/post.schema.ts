import z from "zod";
import { IPost } from "../post.model";
import availabiltyEnum from "../../../common/utils/enum/availablity.enum";
import allowCommentsEnum from "../../../common/utils/enum/allowComments.enum";
import { Types } from "mongoose";
import { genRules } from "../../../common/utils/validationGeneralRules";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional,
      attachments: z.array(genRules.file).optional(),
      createdBy: z.string(),
      tags: z.array(genRules.id),
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
