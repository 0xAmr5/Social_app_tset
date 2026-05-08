import z from "zod";

export const genRules = {
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id"),
  file: z.any(),
};
