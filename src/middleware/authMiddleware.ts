// auth middleware
import jwt from 'jsonwebtoken'
import { Request } from 'express'
import asyncHandler from '../utils/asyncHandler'
import ApiError from '../utils/ApiError'

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new ApiError(401, 'Unauthorized')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)

    req.user = decoded
    next()
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token')
  }
})

export { authMiddleware }
