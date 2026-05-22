import { Worker, Job } from 'bullmq'
import webhookRepository from '../controller/webhook/repository'
import { generateSignatureHeader } from './hmac.util'

// worker.ts
const worker = new Worker(
  'webhook-queue',
  async (job: Job) => {
    const { webhookId, secret , deliveryLogId, url, event, payload } = job.data
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 3)
    const signatureHeader = generateSignatureHeader(
      payload,
      secret,
    )
    console.log(`[Job ${job.id}] Attempt ${job.attemptsMade + 1} → ${url}`)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': signatureHeader, // ← HMAC Signature
          'X-Webhook-ID': webhookId,
          'X-Webhook-Event': event,
        },
        body: JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await webhookRepository.updateDeliveryLog(deliveryLogId, {
        status: 'COMPLETED',
        statusCode: response.status,
        attempts: job.attemptsMade + 1,
        error: null,
      })

      console.log(`[Job ${job.id}] Delivered successfully`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      if (isLastAttempt) {
        await webhookRepository.updateDeliveryLog(deliveryLogId, {
          status: 'FAILED',
          attempts: job.attemptsMade + 1,
          error: errorMessage,
        })

        console.error(`[Job ${job.id}] All attempts failed: ${errorMessage}`)
      }

      throw err
    }
  },
  {
    connection: { host: 'redis', port: 6379 },
  },
)

// global listeners for tracking
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed after all attempts: ${err.message}`)
})

export default worker
