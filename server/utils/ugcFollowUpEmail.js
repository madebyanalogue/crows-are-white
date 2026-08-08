function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildUgcFollowUpEmail({ siteUrl, customerName, orderName }) {
  const shareUrl = `${siteUrl.replace(/\/$/, '')}/share-your-journey`
  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,'
  const orderLine = orderName ? ` (${orderName})` : ''

  const subject = 'Share where your merch travels'

  const text = [
    greeting,
    '',
    `Thank you for your order${orderLine}.`,
    '',
    'We would love to see where Crows Are White merch ends up on its journey. Upload a photo and we will add it to The Journey Continues wall on our site.',
    '',
    shareUrl,
    '',
    'Your photo appears on the wall right away while our team reviews it.',
    '',
    'With thanks,',
    'Crows Are White',
  ].join('\n')

  const html = `
    <p>${escapeHtml(greeting)}</p>
    <p>Thank you for your order${escapeHtml(orderLine)}.</p>
    <p>We would love to see where Crows Are White merch ends up on its journey. Upload a photo and we will add it to <strong>The Journey Continues</strong> wall on our site.</p>
    <p><a href="${escapeHtml(shareUrl)}">Share your photo</a></p>
    <p>Your photo appears on the wall right away while our team reviews it.</p>
    <p>With thanks,<br>Crows Are White</p>
  `

  return {
    subject,
    html,
    text,
    shareUrl,
  }
}

export async function sendUgcFollowUpEmail(config, { to, customerName, orderName }) {
  if (!config.resendApiKey || !config.contactFormFromEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Follow-up email is not configured.',
    })
  }

  const siteUrl = config.public?.siteUrl || 'https://crowsarewhite.com'
  const { subject, html, text } = buildUgcFollowUpEmail({
    siteUrl,
    customerName,
    orderName,
  })

  const { Resend } = await import('resend')
  const resend = new Resend(config.resendApiKey)

  const idempotencyKey = orderName
    ? `ugc-followup-${orderName.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    : `ugc-followup-${to}`

  const { error } = await resend.emails.send(
    {
      from: config.contactFormFromEmail,
      to,
      subject,
      html,
      text,
    },
    {
      idempotencyKey,
    },
  )

  if (error) {
    console.error('UGC follow-up email error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send follow-up email.',
    })
  }

  return { success: true }
}
