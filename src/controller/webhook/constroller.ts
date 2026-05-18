import { Request, Response } from 'express'
import asyncHandler from '../../utils/asyncHandler'
import ApiError from '../../utils/ApiError'
import ApiResponse from '../../utils/ApiResponse'
import {
  registerWebhookService,
  getWebhooksService,
  triggerWebhookService,
  getDeliveryLogsService,
  deleteWebhookService,
  updateWebhookService,
} from './service'
import webhookRepository from './repository'

const registerWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const { url, events } = req.body
    const userId = req.user.userId

    if (!url || !events) {
      throw ApiError.badRequest('url and events are required')
    }

    if (!Array.isArray(events) || events.length === 0) {
      throw ApiError.badRequest('events must be a non-empty array')
    }

    const webhook = await registerWebhookService({ userId, url, events })

    res
      .status(201)
      .json(
        new ApiResponse(201, 'Webhook registered successfully', { webhook }),
      )
  },
)

const getWebhooksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id

    const webhooks = await getWebhooksService(userId)

    res
      .status(200)
      .json(new ApiResponse(200, 'Webhooks fetched successfully', { webhooks }))
  },
)

const triggerWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const { event, payload } = req.body
    const userId = req.user?.id

    if (!event) {
      throw ApiError.badRequest('event is required')
    }

    if (!payload || typeof payload !== 'object') {
      throw ApiError.badRequest('payload is required and must be an object')
    }

    const result = await triggerWebhookService({ userId, event, payload })

    res
      .status(200)
      .json(new ApiResponse(200, 'Event triggered successfully', result))
  },
)

const getDeliveryLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const webhookId = req.params.webhookId as string
    const userId = req.user?.id

    if (!webhookId) {
      throw ApiError.badRequest('webhookId is required')
    }

    const logs = await getDeliveryLogsService({ webhookId, userId })

    res
      .status(200)
      .json(
        new ApiResponse(200, 'Delivery logs fetched successfully', { logs }),
      )
  },
)

const updateWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.webhookId as string
    const { url, events, isActive } = req.body
    const userId = req.user?.id

    if (!url && !events && isActive === undefined) {
      throw ApiError.badRequest(
        'Provide at least one field to update — url, events, or isActive',
      )
    }

    const webhook = await updateWebhookService({
      id,
      userId,
      url,
      events,
      isActive,
    })

    res
      .status(200)
      .json(new ApiResponse(200, 'Webhook updated successfully', { webhook }))
  },
)

const deleteWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.webhookId as string
    const userId = req.user?.id

    await deleteWebhookService({ id, userId })

    res
      .status(200)
      .json(new ApiResponse(200, 'Webhook deleted successfully', null))
  },
)

const getWebhookDeliveriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const webhookId  = req.params.webhookId as string

    const deliveries = await webhookRepository.findDeliveryLogs(webhookId)

    const summary = {
      total: deliveries.length,
      pending: deliveries.filter((d) => d.status === 'PENDING').length,
      completed: deliveries.filter((d) => d.status === 'COMPLETED').length,
      failed: deliveries.filter((d) => d.status === 'FAILED').length,
    }

    res.status(200).json(
      new ApiResponse(200, 'Deliveries fetched', { summary, deliveries })
    )
  },
)


export {
  registerWebhookController,
  getWebhooksController,
  triggerWebhookController,
  getDeliveryLogsController,
  updateWebhookController,
  deleteWebhookController,
  getWebhookDeliveriesController
}
