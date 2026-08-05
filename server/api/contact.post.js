import { Resend } from 'resend'
import {
  buildContactFormSubmission,
  getContactFormReplyToEmail,
  getContactFormSubjectName,
  validateContactFormValues,
} from '~/utils/contactFormFields'
import { createSalesforceLead, isSalesforceConfigured } from '~/server/utils/salesforce'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const fields = Array.isArray(body?.fields) ? body.fields : []
  const values = body?.values && typeof body.values === 'object' ? body.values : {}
  const gdpr = body?.gdpr && typeof body.gdpr === 'object' ? body.gdpr : {}
  const marketingConsent = body?.marketingConsent === true
  const marketingConsentEnabled = gdpr.marketingConsentEnabled === true
  const marketingConsentRequired = gdpr.marketingConsentRequired === true
  const salesforceEnabled = body?.salesforceEnabled !== false

  const validationError = validateContactFormValues(fields, values, {
    marketingConsent,
    marketingConsentRequired,
  })
  if (validationError) {
    throw createError({
      statusCode: 400,
      statusMessage: validationError,
    })
  }

  const config = useRuntimeConfig()

  if (!config.resendApiKey || !config.contactFormFromEmail || !config.contactFormToEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Contact form is not configured.',
    })
  }

  const submissionFields = buildContactFormSubmission(fields, values)
    .filter((field) => field.value)

  if (!submissionFields.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please fill in at least one field.',
    })
  }

  if (salesforceEnabled && isSalesforceConfigured(config)) {
    await createSalesforceLead(submissionFields, config, {
      marketingConsent,
      marketingConsentEnabled,
    })
  }

  const resend = new Resend(config.resendApiKey)
  const subjectName = getContactFormSubjectName(submissionFields)
  const replyTo = getContactFormReplyToEmail(submissionFields)

  const htmlFields = submissionFields
    .map((field) => {
      const isMultiline = field.fieldType === 'message' || field.fieldType === 'customTextarea'
      const value = isMultiline
        ? `<p>${escapeHtml(field.value).replace(/\n/g, '<br>')}</p>`
        : escapeHtml(field.value)

      return `<p><strong>${escapeHtml(field.label)}:</strong> ${value}</p>`
    })
    .join('')

  const textFields = submissionFields
    .map((field) => {
      const isMultiline = field.fieldType === 'message' || field.fieldType === 'customTextarea'
      return isMultiline
        ? `${field.label}:\n${field.value}`
        : `${field.label}: ${field.value}`
    })
    .join('\n')

  const marketingConsentHtml = marketingConsentEnabled
    ? `<p><strong>Marketing consent:</strong> ${marketingConsent ? 'Yes' : 'No'}</p>`
    : ''

  const html = `
    <h2>New contact form submission</h2>
    ${htmlFields}
    ${marketingConsentHtml}
  `

  const marketingConsentText = marketingConsentEnabled
    ? `Marketing consent: ${marketingConsent ? 'Yes' : 'No'}`
    : ''

  const text = [
    'New contact form submission',
    '',
    textFields,
    marketingConsentText,
  ].filter(Boolean).join('\n')

  const emailPayload = {
    from: config.contactFormFromEmail,
    to: config.contactFormToEmail,
    subject: `Contact form: ${subjectName}`,
    html,
    text,
  }

  if (replyTo) {
    emailPayload.replyTo = replyTo
  }

  const { error } = await resend.emails.send(emailPayload)

  if (error) {
    console.error('Resend error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send message. Please try again.',
    })
  }

  return { success: true }
})
