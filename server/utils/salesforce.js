import { createSign } from 'node:crypto'

const API_VERSION = 'v62.0'

let createableLeadFieldsCache = null

function normalizePrivateKey(key) {
  return String(key || '').replace(/\\n/g, '\n').trim()
}

function createJwtAssertion({ clientId, username, loginUrl, privateKey }) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify({
    iss: clientId,
    sub: username,
    aud: loginUrl,
    exp: now + 180,
  }))
  const signingInput = `${header}.${payload}`

  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  sign.end()

  const signature = sign.sign(normalizePrivateKey(privateKey)).toString('base64url')
  return `${signingInput}.${signature}`
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

export function isSalesforceConfigured(config) {
  return Boolean(
    config.salesforceClientId
    && config.salesforceUsername
    && config.salesforcePrivateKey,
  )
}

async function getSalesforceAccessToken(config) {
  const loginUrl = config.salesforceLoginUrl || 'https://login.salesforce.com'
  const assertion = createJwtAssertion({
    clientId: config.salesforceClientId,
    username: config.salesforceUsername,
    loginUrl,
    privateKey: config.salesforcePrivateKey,
  })

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  })

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Salesforce auth error:', data)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to submit to Salesforce. Please try again.',
    })
  }

  return data
}

async function getCreateableLeadFields(accessToken, instanceUrl) {
  if (createableLeadFieldsCache) {
    return createableLeadFieldsCache
  }

  const response = await fetch(`${instanceUrl}/services/data/${API_VERSION}/sobjects/Lead/describe`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Salesforce describe error:', data)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to submit to Salesforce. Please try again.',
    })
  }

  createableLeadFieldsCache = new Set(
    data.fields.filter((field) => field.createable).map((field) => field.name),
  )

  return createableLeadFieldsCache
}

const LEAD_FIELD_LABELS = {
  FirstName: 'First Name',
  LastName: 'Last Name',
  Email: 'Email',
  Phone: 'Telephone',
  Company: 'Company',
  LeadSource: 'Lead Source',
}

export function buildSalesforceLeadPayload(submissionFields, config, createableFields, options = {}) {
  const byName = Object.fromEntries(
    submissionFields.map((field) => [field.name, field.value]),
  )

  const customFields = submissionFields
    .filter((field) => field.name.startsWith('custom_'))
    .map((field) => `${field.label}: ${field.value}`)

  const descriptionParts = [
    byName.message,
    ...customFields,
  ].filter(Boolean)

  if (options.marketingConsentEnabled) {
    descriptionParts.push(
      `Marketing consent: ${options.marketingConsent ? 'Yes' : 'No'}`,
    )
  }

  const desired = {
    FirstName: byName.firstName || undefined,
    LastName: byName.lastName || 'Website enquiry',
    Email: byName.email || undefined,
    Phone: byName.telephone || undefined,
    Company: config.salesforceLeadCompany || 'Crows Are White Website',
    LeadSource: config.salesforceLeadSource || 'Website',
  }

  const payload = {}
  const overflow = [...descriptionParts]

  for (const [fieldName, value] of Object.entries(desired)) {
    if (!value) continue

    if (createableFields.has(fieldName)) {
      payload[fieldName] = value
    } else {
      overflow.unshift(`${LEAD_FIELD_LABELS[fieldName] || fieldName}: ${value}`)
    }
  }

  if (overflow.length && createableFields.has('Description')) {
    payload.Description = overflow.join('\n\n')
  }

  return payload
}

export async function createSalesforceLead(submissionFields, config, options = {}) {
  const { access_token: accessToken, instance_url: instanceUrl } = await getSalesforceAccessToken(config)
  const createableFields = await getCreateableLeadFields(accessToken, instanceUrl)
  const lead = buildSalesforceLeadPayload(submissionFields, config, createableFields, options)

  if (!Object.keys(lead).length) {
    console.error('Salesforce lead error: no createable Lead fields available for integration user')
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to submit to Salesforce. Please try again.',
    })
  }

  const response = await fetch(`${instanceUrl}/services/data/${API_VERSION}/sobjects/Lead/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lead),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Salesforce lead error:', data)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to submit to Salesforce. Please try again.',
    })
  }

  return data
}
