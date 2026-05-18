import { createHmac } from 'crypto'

const generateSignature = (payload: any, secret: string): string => {
  if (!secret) {
    throw new Error('Secret key is required for HMAC signing')
  }

  const hmac = createHmac('sha256', secret)

  // Important: Convert payload to string consistently
  const payloadString =
    typeof payload === 'string' ? payload : JSON.stringify(payload)

  hmac.update(payloadString)

  return hmac.digest('hex')
}

export const generateSignatureHeader = (
  payload: any,
  secret: string,
): string => {
  const signature = generateSignature(payload, secret)
  return `sha256=${signature}`
}
