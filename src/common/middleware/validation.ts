import type { Request, Response, NextFunction } from "express";
import { safeParseAsync, z } from "zod";
import { appError } from "../utils/global-error-handler";

type reqType = keyof Request;
export type schemaType = Partial<Record<reqType, z.ZodSchema>>;

export const validationMiddleWare = (schema: schemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const arrOfError = [];
    for (const key of Object.keys(schema) as reqType[]) {
      if (!req[key]) continue;

      if (req?.file) {
        req.body.attachment = req.file;
      }
      if (req?.files) {
        req.body.attachments = req.files;
      }

      const result = (await schema[key]?.safeParseAsync(req[key])) as {
        success: boolean;
        error: any;
      };
      if (!result.success) {
        arrOfError.push(result?.error.message);
      }
    }

    if (arrOfError.length > 0) {
      throw new appError(
        "validation error",
        JSON.parse(arrOfError as unknown as string),
        400
      );
    }
    next();
  };
};

export const Validation = validationMiddleWare;
