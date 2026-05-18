import { prisma } from '../../config/prisma'

const userRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email: email } })
  },

  create: async (parmas: { email: string; password: string }) => {
    return prisma.user.create({
      data: { email: parmas.email, password: parmas.password },
      select: { email: true, id: true },
    })
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    })
  },
}

export default userRepository
