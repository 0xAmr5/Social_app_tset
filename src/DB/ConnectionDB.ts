import mongoose from 'mongoose'
import { MONGO_URI } from '../config/config.service'

const connectDb = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not configured')
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('DB connected successfully')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    throw error
  }
}

export default connectDb
