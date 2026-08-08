import {
  getShopifyOrderEmail,
  getShopifyOrderId,
  getShopifyOrderName,
  getShopifyWebhookHeader,
  parseShopifyOrderPayload,
  verifyShopifyWebhook,
} from '~/server/utils/shopifyWebhook'
import { sendUgcFollowUpEmail } from '~/server/utils/ugcFollowUpEmail'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = config.shopifyWebhookSecret

  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Shopify webhook is not configured.',
    })
  }

  const rawBody = await readRawBody(event, false)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing request body.',
    })
  }

  const hmac = getShopifyWebhookHeader(event, 'X-Shopify-Hmac-Sha256')
  if (!verifyShopifyWebhook(rawBody, hmac, secret)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid webhook signature.',
    })
  }

  const order = parseShopifyOrderPayload(rawBody)
  if (!order) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order payload.',
    })
  }

  const email = getShopifyOrderEmail(order)
  if (!email) {
    return { success: true, skipped: true, reason: 'no_email' }
  }

  const customerName = String(
    order?.customer?.first_name
    || order?.billing_address?.first_name
    || '',
  ).trim()

  await sendUgcFollowUpEmail(config, {
    to: email,
    customerName,
    orderName: getShopifyOrderName(order) || getShopifyOrderId(order),
  })

  return { success: true }
})
