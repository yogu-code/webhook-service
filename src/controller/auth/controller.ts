import { Request, Response } from 'express'
import asyncHandler from '../../utils/asyncHandler'
import ApiError from '../../utils/ApiError'
import ApiResponse from '../../utils/ApiResponse'
import { loginService, signupService } from './service'

const signupController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw ApiError.badRequest('email and password are required')
  }

  const { user, accessToken } = await signupService({ email, password })

  res.status(201).json(
    new ApiResponse(201, 'Account created successfully', {
      user,
      accessToken,
    }),
  )
})

const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw ApiError.badRequest('email and password are required')
  }

  const { user, accessToken } = await loginService({ email, password })

  res.status(200).json(
    new ApiResponse(200, 'Log in successfully', {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    }),
  )
})

export { signupController, loginController }
