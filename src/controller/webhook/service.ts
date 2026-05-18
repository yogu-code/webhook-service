import ApiError from '../../utils/ApiError'
import { addWebhookJob } from '../../utils/producer'
import webhookRepository from './repository'

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const registerWebhookService = async (params: {
  userId: string
  url: string
  events: string[]
}) => {
  if (!isValidUrl(params.url)) {
    throw ApiError.badRequest('Invalid URL — must be a valid http or https URL')
  }

  if (
    params.events !== undefined &&
    (!Array.isArray(params.events) ||
      params.events.length === 0 ||
      params.events.some(
        (event) => typeof event !== 'string' || event.trim() === '',
      ))
  ) {
    throw ApiError.badRequest(
      'events must be a non-empty array of valid strings',
    )
  }

  const existing = await webhookRepository.findByUserAndUrl(
    params.userId,
    params.url,
  )

  if (existing) {
    throw ApiError.badRequest('A webhook with this URL is already registered')
  }

  const webhook = await webhookRepository.create({
    userId: params.userId,
    url: params.url,
    events: params.events,
  })

  return webhook
}

const getWebhooksService = async (userId: string) => {
  return webhookRepository.findAllByUser(userId)
}

const triggerWebhookService = async (params: {
  userId: string
  event: string
  payload: object
}) => {
  const webhooks = await webhookRepository.findByUserAndEvent(
    params.userId,
    params.event,
  )

  if (webhooks.length === 0) {
    return { total: 0, queued: 0 }
  }

  // enqueue one job per webhook — don't fetch here
  await Promise.all(
    webhooks.map(async (webhook) => {
      // 1. create delivery log as pending FIRST
      const deliveryLog = await webhookRepository.createDeliveryLog({
        webhookId: webhook.id,
        event: params.event,
        payload: params.payload,
        status: 'PENDING',
        attempts: 0,
        statusCode: null,
        success: false,
        error: null,
      })

      // 2. enqueue job with deliveryLogId so worker can update it
      await addWebhookJob({
        webhookId: webhook.id,
        deliveryLogId: deliveryLog.id,
        url: webhook.url,
        event: params.event,
        payload: params.payload,
      })
    }),
  )

  return { total: webhooks.length, queued: webhooks.length }
}

const getDeliveryLogsService = async (params: {
  webhookId: string
  userId: string
}) => {
  const logs = await webhookRepository.findLogsByWebhookId(
    params.webhookId,
    params.userId,
  )

  if (!logs.length) {
    return []
  }

  return logs
}

const updateWebhookService = async (params: {
  id: string
  userId: string
  url?: string
  events?: string[]
  isActive?: boolean
}) => {
  const webhook = await webhookRepository.findById(params.id, params.userId)

  if (!webhook) {
    throw ApiError.notFound('Webhook not found')
  }

  if (params.url && !isValidUrl(params.url)) {
    throw ApiError.badRequest('Invalid URL — must be a valid http or https URL')
  }

  if (params.isActive !== undefined && typeof params.isActive !== 'boolean') {
    throw ApiError.badRequest('isActive must be a boolean')
  }

  if (
    params.events !== undefined &&
    (!Array.isArray(params.events) ||
      params.events.length === 0 ||
      params.events.some(
        (event) => typeof event !== 'string' || event.trim() === '',
      ))
  ) {
    throw ApiError.badRequest(
      'events must be a non-empty array of valid strings',
    )
  }

  return webhookRepository.update(params.id, {
    url: params.url,
    events: params.events,
    isActive: params.isActive,
  })
}

const deleteWebhookService = async (params: { id: string; userId: string }) => {
  const webhook = await webhookRepository.findById(params.id, params.userId)

  if (!webhook) {
    throw ApiError.notFound('Webhook not found')
  }

  await webhookRepository.delete(params.id)
}

export {
  registerWebhookService,
  getWebhooksService,
  triggerWebhookService,
  getDeliveryLogsService,
  updateWebhookService,
  deleteWebhookService,
}
