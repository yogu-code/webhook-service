import { Request, Response, NextFunction } from 'express'
import ApiError from '../utils/ApiError'

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Something went wrong'
    error = new ApiError(statusCode, message, [], err.stack)
  }

  return res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  })
}

export default errorHandler