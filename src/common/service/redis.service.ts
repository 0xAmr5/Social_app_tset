import { Types } from 'mongoose'
import { createClient, RedisClientType } from 'redis'
import { emailEnum } from '../enum/email.enum.js'
import { REDIS_URL } from '../../config/config.service.js'

class RedisService {
  private readonly client: RedisClientType

  constructor() {
    this.client = createClient({
      url: REDIS_URL,
    })
    this.handleEvent()
  }

  async connect() {
    await this.client.connect()
    console.log('Connected to Redis successfully!')
  }

  handleEvent() {
    this.client.on('error', (error) => {
      console.log('Connected to Redis failed!', error)
    })
  }

  revoked_key = ({ userId, jti }: { userId: Types.ObjectId; jti: string }) => {
    return `revoke_token:${userId}:${jti}`
  }

  get_key = (userId: Types.ObjectId) => {
    return `revoke_token:${userId}`
  }

  otp_key = ({
    email,
    subject = emailEnum.confirmEmail,
  }: {
    email: string
    subject?: emailEnum
  }) => {
    return `otp:${email}:${subject}`
  }
}

export default new RedisService()
