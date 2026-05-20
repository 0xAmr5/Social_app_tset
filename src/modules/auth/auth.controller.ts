import auth from "./auth.service.js";
import { Router } from "express";
import { confirmSignUpSchema, forgetPassword, googleSignupSchema, resendOtpSchema, resetPassowrd, signInSchema, signUpSchema } from "./auth.validation";
import { validationMiddleWare } from "../../common/middleware/validation.js";
import { authenticate } from "../../common/middleware/authenticate.js";

export const authRouter: Router = Router();

authRouter.post("/sign-up", validationMiddleWare(signUpSchema), auth.signUp);
authRouter.post(
  "/confirm-sign-up",
  validationMiddleWare(confirmSignUpSchema),
  auth.confirmMail,
);
authRouter.post("/log-in", validationMiddleWare(signInSchema), auth.logIn);
authRouter.post('/resend-otp', validationMiddleWare(resendOtpSchema), auth.reSendOtp)
authRouter.post("/sign-with-google", validationMiddleWare(googleSignupSchema), auth.signUpAndLoginWithGmail);
authRouter.post("/get-profile",authenticate, auth.getProfile);
authRouter.put(
  "/forget-password",
  validationMiddleWare(forgetPassword),
  auth.forgetPassword,
);

authRouter.patch(
  "/reset-password",
  validationMiddleWare(resetPassowrd),
  auth.resetPassowrd,
);

export default authRouter;
