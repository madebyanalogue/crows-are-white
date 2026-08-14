const JSONP_TIMEOUT_MS = 15000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAILCHIMP_ERROR_HINTS = [
  {
    test: /already subscribed|already a list member|already on (the|this) list|previously unsubscribed/i,
    message: 'This email is already subscribed',
  },
  {
    test: /invalid.*email|valid email|enter a real email|looks fake|fake or invalid|must contain an @/i,
    message: 'Please enter a valid email address',
  },
  {
    test: /enter a value|cannot be blank|field is required|required field/i,
    message: 'Please enter your email address',
  },
  {
    test: /signed up to a lot of lists|try again later|too many/i,
    message: 'Too many signup attempts. Please try again in a few minutes',
  },
  {
    test: /domain.*not allowed|will not accept|blocked domain/i,
    message: 'This email domain cannot be used for signup',
  },
  {
    test: /contact us|contact support|get in touch/i,
    message: 'We couldn\'t complete your signup. Please contact us for help',
  },
]

export function getMailchimpJsonUrl(actionUrl) {
  if (!actionUrl) return ''
  if (actionUrl.includes('post-json')) return actionUrl
  return actionUrl.replace('post?', 'post-json?')
}

export function normalizeMailchimpMessage(message) {
  return String(message || '')
    .replace(/^\d+\s*-\s*/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
}

export function validateNewsletterEmail(email) {
  const value = String(email || '').trim()

  if (!value) {
    return 'Please enter your email address'
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Please enter a valid email address'
  }

  return ''
}

export function resolveMailchimpFeedback(data, {
  successMessage = 'Thanks — check your inbox to confirm',
  errorMessage = 'Unable to subscribe. Please try again',
} = {}) {
  const raw = normalizeMailchimpMessage(data?.msg)

  if (data?.result === 'success') {
    return {
      type: 'success',
      text: raw || successMessage,
    }
  }

  if (raw) {
    for (const { test, message } of MAILCHIMP_ERROR_HINTS) {
      if (test.test(raw)) {
        return { type: 'error', text: message }
      }
    }

    return { type: 'error', text: raw }
  }

  return { type: 'error', text: errorMessage }
}

function getSubscribeLoadError(actionUrl) {
  if (!actionUrl || actionUrl.includes('PLACEHOLDER')) {
    return 'Newsletter signup is not configured yet'
  }

  return 'Unable to subscribe right now. Please check your connection and try again'
}

export function subscribeToMailchimp(actionUrl, email) {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Unable to subscribe right now'))
  }

  const jsonUrl = getMailchimpJsonUrl(actionUrl)
  if (!jsonUrl) {
    return Promise.reject(new Error('Newsletter signup is unavailable'))
  }

  const callbackName = `mc_${Date.now()}_${Math.random().toString(36).slice(2)}`

  return new Promise((resolve, reject) => {
    const url = new URL(jsonUrl)
    url.searchParams.set('EMAIL', email)
    url.searchParams.set('c', callbackName)

    const script = document.createElement('script')
    let settled = false

    const timeoutId = window.setTimeout(() => {
      finish(new Error('Request timed out. Please try again'))
    }, JSONP_TIMEOUT_MS)

    function finish(error, data) {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      delete window[callbackName]
      script.remove()
      if (error) reject(error)
      else resolve(data)
    }

    window[callbackName] = (data) => finish(null, data)
    script.onerror = () => finish(new Error(getSubscribeLoadError(actionUrl)))
    script.src = url.toString()
    document.head.appendChild(script)
  })
}
