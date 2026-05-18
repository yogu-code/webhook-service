import { Router } from 'express'
import {
  deleteWebhookController,
  getDeliveryLogsController,
  getWebhookDeliveriesController,
  getWebhooksController,
  registerWebhookController,
  triggerWebhookController,
  updateWebhookController,
} from '../controller/webhook/constroller'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.post('/register', authMiddleware, registerWebhookController)
router.get('/', authMiddleware, getWebhooksController)
router.post('/trigger' , authMiddleware , triggerWebhookController)
router.get('/:webhookId/logs' , authMiddleware , getDeliveryLogsController)
router.delete('/:webhookId' , authMiddleware , deleteWebhookController)
router.patch('/:webhookId' , authMiddleware , updateWebhookController)
router.get('/:webhookId/status' , authMiddleware , getWebhookDeliveriesController)

export default router
