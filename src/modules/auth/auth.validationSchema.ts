import zod from "zod";
export const signUpSchema = {
  body: zod
    .object({
      userName: zod.string(),
      email: zod.email(),
      password: zod.string(),
      cpassword: zod.string(),
      phone: zod.string().optional(),
      role: zod.string().optional(),
      gender: zod.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.password != data.cpassword) {
        ctx.addIssue({
          code: "custom",
          message: "passwords do not match",
          path: ["cpassword"],
        });
      }
    }),
};
export const signInSchema = {
  body: zod.object({
    email: zod.email(),
    password: zod.string(),
  }),
};

export const confirmSignUpSchema = {
  body: zod.object({
    email: zod.email(),
    otp: zod.string().length(5),
  }),
};

export const forgetPassword = {
body : zod.object({
    email : zod.email(),
})
}
export const resetPassowrd = {
  body: zod.object({
    email : zod.email(),
    newPassword : zod.string(),
    otp : zod.string().length(5),
  }),
};