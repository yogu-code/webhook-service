import jwt from 'jsonwebtoken'
import ApiError from './ApiError'

interface TokenPayload {
  userId: string
  email: string
}

const generateAccessToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw ApiError.internal('JWT_SECRET is not defined')
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '6h',
  })
}

const generateRefreshToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw ApiError.internal('JWT_REFRESH_SECRET is not defined')
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  })
}

const generateTokens = (payload: TokenPayload): { accessToken: string } => {
  const accessToken = generateAccessToken(payload)
  // const refreshToken = generateRefreshToken(payload)
  return { accessToken }
}

export { generateAccessToken, generateRefreshToken, generateTokens }
