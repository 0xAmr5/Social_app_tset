import { JwtPayload } from 'jsonwebtoken'
import { IUser } from '../DB/models/user.model'

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null
      decoded?: JwtPayload
      token?: string
      tokenDecoded?: JwtPayload
      file?: Multer.File
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] }
    }
  }
}

export {}
