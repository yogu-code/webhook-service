import { NextFunction, Request, Response } from 'express'

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>

const asyncHandler =
  (fn: AsyncFn) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      })
    }
  }

export default asyncHandler
