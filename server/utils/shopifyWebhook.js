import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyShopifyWebhook(rawBody, hmacHeader, secret) {
  if (!secret || !hmacHeader || !rawBody) return false

  const digest = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')

  try {
    return timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(hmacHeader, 'utf8'))
  } catch {
    return false
  }
}

export function getShopifyWebhookHeader(event, name) {
  return getRequestHeader(event, name) || getRequestHeader(event, name.toLowerCase()) || ''
}

export function parseShopifyOrderPayload(rawBody) {
  try {
    return JSON.parse(rawBody.toString('utf8'))
  } catch {
    return null
  }
}

export function getShopifyOrderEmail(order) {
  return String(
    order?.email
    || order?.contact_email
    || order?.customer?.email
    || '',
  ).trim()
}

export function getShopifyOrderId(order) {
  return String(order?.id || order?.admin_graphql_api_id || '').trim()
}

export function getShopifyOrderName(order) {
  return String(order?.name || order?.order_number || '').trim()
}
