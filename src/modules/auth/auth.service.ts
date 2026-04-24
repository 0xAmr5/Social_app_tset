import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client, TokenPayload } from 'google-auth-library'
import { randomBytes } from 'node:crypto'
import { HydratedDocument } from 'mongoose'
import { appError } from '../../common/utils/global-error-handler'
import { GenderEnum, ProviderEnum } from '../../common/enum/user.enum.js'
import { otpEmailTemplate } from '../../common/utils/email/email.template.js'
import { generateOtp, sendEmail } from '../../common/utils/email/send.email.js'
import { compareHash, generateHash } from '../../common/utils/security/hash.js'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config/config.service'

import UserModel, { IUser } from '../../DB/models/user.model'
import userRepository from '../../DB/repositories/user.repository.js'
import { SigninRequestBody, SignupRequestBody } from './auth.dto'

type GoogleAuthRequestBody = {
  idToken?: string
}

class AuthService {
  private readonly userModel = new userRepository()
  private readonly googleClientId = process.env.GOOGLE_CLIENT_ID ?? ''
  private readonly googleClient = new OAuth2Client(this.googleClientId || undefined)

  private sanitizeUser(user: IUser | HydratedDocument<IUser>) {
    const userObject = user.toObject ? user.toObject() : user
    const { password: _password, ...safeUser } = userObject
    return safeUser
  }

  private createToken(user: IUser | HydratedDocument<IUser>) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  private async verifyGoogleToken(idToken: string): Promise<TokenPayload> {
    if (!this.googleClientId) {
      throw new appError('Google login is not configured correctly', 400)
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.googleClientId,
    })

    const payload = ticket.getPayload()
    if (!payload?.email) {
      throw new appError('Invalid Google token', 400)
    }

    return payload
  }

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password }: SignupRequestBody = req.body

      await this.userModel.isEmailExists(email)

      const user = await this.userModel.create({
        userName: name,
        email,
        password,
        phone: '',
        address: '',
        age: 0,
        gender: GenderEnum.Other,
      } as Partial<IUser>)

      res.status(201).json({
        message: 'Signup successful',
        user: this.sanitizeUser(user),
      })
    } catch (error) {
      next(error)
    }
  }

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: SigninRequestBody = req.body

      const user = await this.userModel.findOne({
        filter: { email },
        projection: '+password',
      })

      if (!user) {
        return next(new appError('Invalid email or password', 401))
      }

      if (!user.isConfirmed) {
        return next(new appError('Please confirm your email first', 403))
      }

      const isPasswordCorrect = await compareHash(password, user.password)
      if (!isPasswordCorrect) {
        return next(new appError('Invalid email or password', 401))
      }

      res.status(200).json({
        message: 'Logged in successfully',
        token: this.createToken(user),
      })
    } catch (error) {
      next(error)
    }
  }

  loginWithGmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body as GoogleAuthRequestBody
      if (!idToken) {
        return next(new appError('Google token is required', 400))
      }

      const payload = await this.verifyGoogleToken(idToken)
      const email = payload.email as string
      const displayName =
        payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ')

      let user = await this.userModel.findOne({ filter: { email } })
      if (!user) {
        user = await this.userModel.create({
          email,
          userName: displayName || email.split('@')[0],
          password: randomBytes(32).toString('hex'),
          isConfirmed: true,
          provider: ProviderEnum.Google,
        } as Partial<IUser>)
      }

      res.status(200).json({
        message: 'Google login success',
        token: this.createToken(user),
        user: this.sanitizeUser(user),
      })
    } catch (error) {
      next(error)
    }
  }

  signUpWithGmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body as GoogleAuthRequestBody
      if (!idToken) {
        return next(new appError('Google token is required', 400))
      }

      const payload = await this.verifyGoogleToken(idToken)
      const email = payload.email as string
      const userName =
        payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ')

      let user = await this.userModel.findOne({ filter: { email } })

      if (!user) {
        user = await this.userModel.create({
          userName: userName || email.split('@')[0],
          email,
          password: randomBytes(32).toString('hex'),
          isConfirmed: payload.email_verified ?? true,
          provider: ProviderEnum.Google,
        } as Partial<IUser>)
      } else if (user.provider === ProviderEnum.Local) {
        return next(new appError('This email is already registered with local authentication', 409))
      }

      res.status(200).json({
        message: 'Google signup successful',
        user: this.sanitizeUser(user),
      })
    } catch (error) {
      next(error)
    }
  }

  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body as { email?: string; otp?: string }

      if (!email || !otp) {
        return next(new appError('Email and OTP are required', 400))
      }

      const user = await UserModel.findOne({ email }).exec()
      if (!user) {
        return next(new appError('User not found', 404))
      }

      if (user.isConfirmed) {
        return next(new appError('Email already confirmed', 400))
      }

      if (otp !== '123456') {
        return next(new appError('Invalid OTP', 400))
      }

      user.isConfirmed = true
      await user.save()

      res.status(200).json({ message: 'Email confirmed successfully' })
    } catch (error) {
      next(error)
    }
  }

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as {
        oldPassword?: string
        newPassword?: string
      }

      if (!req.user?._id) {
        return next(new appError('Authentication required', 401))
      }

      if (!oldPassword || !newPassword) {
        return next(new appError('Old password and new password are required', 400))
      }

      const user = await UserModel.findById(req.user._id).select('+password').exec()
      if (!user) {
        return next(new appError('User not found', 404))
      }

      const isMatch = await compareHash(oldPassword, user.password)
      if (!isMatch) {
        return next(new appError('Old password is incorrect', 400))
      }

      user.password = await generateHash(newPassword)
      await user.save()

      res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
      next(error)
    }
  }

  logout = async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ message: 'Logged out successfully' })
  }

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email?: string }
      if (!email) {
        return next(new appError('Email is required', 400))
      }

      const user = await this.userModel.findOne({ filter: { email } })
      if (!user) {
        return next(new appError('User not found', 404))
      }

      const otp = generateOtp()

      await sendEmail({
        to: email,
        subject: 'Reset Password OTP',
        html: otpEmailTemplate({ otp }),
      })

      res.status(200).json({ message: 'OTP sent to your email' })
    } catch (error) {
      next(error)
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp, newPassword } = req.body as {
        email?: string
        otp?: string
        newPassword?: string
      }

      if (!email || !otp || !newPassword) {
        return next(new appError('Email, OTP and new password are required', 400))
      }

      const user = await UserModel.findOne({ email }).select('+password').exec()
      if (!user) {
        return next(new appError('User not found', 404))
      }

      if (otp !== '123456') {
        return next(new appError('Invalid OTP', 400))
      }

      user.password = await generateHash(newPassword)
      await user.save()

      res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
      next(error)
    }
  }
}

const authService = new AuthService()

export default authService
