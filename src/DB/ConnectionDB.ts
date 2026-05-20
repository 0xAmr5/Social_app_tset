import mongoose from 'mongoose'
import { IS_PRODUCTION, MONGO_URI } from '../config/config.service'

const connectDb = async () => {
  if (!MONGO_URI) {
    const message = 'MONGO_URI is not configured'
    if (IS_PRODUCTION) {
      throw new Error(message)
    }

    console.warn(`${message}. Database connection skipped in development`)
    return false
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    })
    console.log('DB connected successfully')
    return true
  } catch (error) {
    if (IS_PRODUCTION) {
      console.error('Failed to connect to MongoDB', error)
      throw error
    }

    const message = error instanceof Error ? error.message : String(error)
    console.warn(`MongoDB connection skipped in development: ${message}`)
    return false
  }
}

export default connectDb
