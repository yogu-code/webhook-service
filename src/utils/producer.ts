import { Queue } from 'bullmq'

const queue = new Queue('webhook-queue', {
  connection: { host: 'redis', port: 6379 },
})

export async function addWebhookJob(params: {
  webhookId: string
  deliveryLogId: string
  url: string
  event: string
  payload: object
  secret : string
}) {
  const job = await queue.add(
    `webhook-${params.webhookId}`,
    {
      webhookId: params.webhookId,
      deliveryLogId: params.deliveryLogId,
      url: params.url,
      event: params.event,
      payload: params.payload,
      secret : params.secret
    },
    {
      attempts: 3, // retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s → 10s → 20s
      },
      removeOnComplete: true,
      removeOnFail: false, // keep failed jobs for inspection
    },
  )

  console.log(`Job enqueued: ${job.id}`)
  return job.id
}
