import * as z from 'zod'
import { GenderEnum } from '../../common/enum/user.enum'

export const signUpSchema = {
  body: z
    .object({
      userName: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(4),
      cpassword: z.string().min(4),
      phone: z.string().trim().optional(),
      address: z.string().trim().optional(),
      age: z.coerce.number().int().positive().optional(),
      gender: z.enum(GenderEnum).optional(),
    })
    .refine(data => data.password === data.cpassword, {
      message: 'passwords do not match',
      path: ['cpassword'],
    }),
}

export const signInSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(4),
    fcm: z.string().trim().optional(),
  }),
}

export const confirmSignUpSchema = {
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(5),
  }),
}

export const resendOtpSchema = {
  body: z.object({
    email: z.string().email(),
  }),
}

export const googleSignupSchema = {
  body: z.object({
    idToken: z.string().min(1),
  }),
}

export const forgetPassword = resendOtpSchema

export const resetPassowrd = {
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(5),
    password: z.string().min(4),
  }),
}

export type SignUp = z.infer<typeof signUpSchema.body>
export type SignIn = z.infer<typeof signInSchema.body>
export type ResendOtp = z.infer<typeof resendOtpSchema.body>
export type GoogleSignup = z.infer<typeof googleSignupSchema.body>
export type ConfirmEmail = z.infer<typeof confirmSignUpSchema.body>
export type ForgetPassword = z.infer<typeof forgetPassword.body>
export type ResetPassword = z.infer<typeof resetPassowrd.body>
export type UpdatePassword = {
  oldPassword: string
  password: string
}
