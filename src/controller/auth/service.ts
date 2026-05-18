import ApiError from '../../utils/ApiError'
import { generateTokens } from '../../utils/auth.utils'
import userRepository from './repository'
import bcrypt from 'bcryptjs'

const signupService = async (params: { email: string; password: string }) => {
  const existingUser = await userRepository.findByEmail(
    params.email.toLowerCase().trim(),
  )

  if (existingUser) {
    throw ApiError.badRequest('An account with this email already exists')
  }

  const hashedPassword = await bcrypt.hash(params.password, 12)

  const user = await userRepository.create({
    email: params.email.toLowerCase().trim(),
    password: hashedPassword,
  })

  const { accessToken } = generateTokens({
    userId: user.id,
    email: user.email,
  })

  return { user, accessToken }
}

const loginService = async (params: { email: string; password: string }) => {
  const user = await userRepository.findByEmail(
    params.email.toLowerCase().trim(),
  )

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const isPasswordValid = await bcrypt.compare(params.password, user.password)

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const { accessToken } = generateTokens({
    userId: user.id,
    email: user.email,
  })

  return { user, accessToken }
}

export { signupService, loginService }
