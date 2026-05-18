import { prisma } from '../../config/prisma'

const webhookRepository = {
  findByUserAndUrl: async (userId: string, url: string) => {
    return prisma.webhook.findUnique({
      where: { userId_url: { userId, url } },
    })
  },

  create: async (params: { userId: string; url: string; events: string[] , secret : string }) => {
    return prisma.webhook.create({
      data: {
        userId: params.userId,
        url: params.url,
        events: params.events,
        secret : params.secret
      },
    })
  },

  findAllByUser: async (userId: string) => {
    return prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  findByUserAndEvent: async (userId: string, event: string) => {
    return prisma.webhook.findMany({
      where: {
        userId,
        events: { has: event },
        isActive: true,
      },
    })
  },

  createDeliveryLog: async (params: {
    webhookId: string
    event: string
    payload: object
    statusCode: number | null
    success: boolean
    error: string | null
    status: 'PENDING' | 'COMPLETED' | 'FAILED'
    attempts: number
  }) => {
    return prisma.deliveryLog.create({
      data: {
        webhookId: params.webhookId,
        event: params.event,
        payload: params.payload,
        statusCode: params.statusCode,
        success: params.success,
        error: params.error,
        status: params.status,
        attempts: params.attempts,
      },
    })
  },

  findLogsByWebhookId: async (webhookId: string, userId: string) => {
    return prisma.deliveryLog.findMany({
      where: {
        webhookId,
        webhook: { userId }, // ensures user can only see their own logs
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById: async (id: string, userId: string) => {
    return prisma.webhook.findUnique({
      where: { id, userId },
    })
  },

  update: async (
    id: string,
    params: {
      url?: string
      events?: string[]
      isActive?: boolean
    },
  ) => {
    return prisma.webhook.update({
      where: { id },
      data: {
        ...(params.url && { url: params.url }),
        ...(params.events && { events: params.events }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
      },
    })
  },

  delete: async (id: string) => {
    return prisma.webhook.delete({
      where: { id },
    })
  },

  updateDeliveryLog: async (
    deliveryLogId: string,
    data: {
      status: 'PENDING' | 'COMPLETED' | 'FAILED'
      statusCode?: number | null
      attempts: number
      error: string | null
    },
  ) => {
    return await prisma.deliveryLog.update({
      where: { id: deliveryLogId },
      data: {
        status: data.status,
        statusCode: data.statusCode,
        attempts: data.attempts,
        error: data.error,
        updatedAt: new Date(),
      },
    })
  },

  findDeliveryLogs: async (webhookId: string) => {
    return await prisma.deliveryLog.findMany({
      where: { webhookId: webhookId }
    })
  },
}

export default webhookRepository
