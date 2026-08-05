export const CONTACT_FORM_FIELD_PRESETS = {
  firstName: {
    label: 'First Name',
    inputType: 'text',
    name: 'firstName',
    autocomplete: 'given-name',
    required: true,
    width: 'half',
  },
  lastName: {
    label: 'Last Name',
    inputType: 'text',
    name: 'lastName',
    autocomplete: 'family-name',
    required: true,
    width: 'half',
  },
  email: {
    label: 'Email',
    inputType: 'email',
    name: 'email',
    autocomplete: 'email',
    required: true,
    width: 'half',
  },
  telephone: {
    label: 'Telephone',
    inputType: 'tel',
    name: 'telephone',
    autocomplete: 'tel',
    required: true,
    width: 'half',
  },
  message: {
    label: 'Message',
    inputType: 'textarea',
    name: 'message',
    autocomplete: 'off',
    required: false,
    width: 'full',
  },
}

export const DEFAULT_CONTACT_FORM_FIELDS = [
  { _key: 'firstName', fieldType: 'firstName' },
  { _key: 'lastName', fieldType: 'lastName' },
  { _key: 'email', fieldType: 'email' },
  { _key: 'telephone', fieldType: 'telephone' },
  { _key: 'message', fieldType: 'message' },
]

export function resolveContactFormField(field) {
  if (!field?.fieldType) return null

  const preset = CONTACT_FORM_FIELD_PRESETS[field.fieldType]
  if (preset) {
    return {
      ...preset,
      label: field.label?.trim() || preset.label,
      fieldType: field.fieldType,
      id: `contact-${field._key || preset.name}`,
      key: field._key || preset.name,
    }
  }

  if (field.fieldType === 'customText') {
    return {
      label: field.label?.trim() || 'Text',
      inputType: 'text',
      name: `custom_${field._key}`,
      autocomplete: 'off',
      required: field.required === true,
      width: field.width === 'half' ? 'half' : 'full',
      fieldType: field.fieldType,
      id: `contact-${field._key}`,
      key: field._key,
      isCustom: true,
    }
  }

  if (field.fieldType === 'customTextarea') {
    return {
      label: field.label?.trim() || 'Message',
      inputType: 'textarea',
      name: `custom_${field._key}`,
      autocomplete: 'off',
      required: field.required === true,
      width: 'full',
      fieldType: field.fieldType,
      id: `contact-${field._key}`,
      key: field._key,
      isCustom: true,
    }
  }

  return null
}

export function resolveContactFormFields(fields) {
  const source = fields?.length ? fields : DEFAULT_CONTACT_FORM_FIELDS
  return source.map(resolveContactFormField).filter(Boolean)
}

export function groupContactFormFieldsIntoRows(fields) {
  const resolved = resolveContactFormFields(fields)
  const rows = []
  let currentRow = []

  for (const field of resolved) {
    if (field.width === 'full') {
      if (currentRow.length) {
        rows.push(currentRow)
        currentRow = []
      }
      rows.push([field])
      continue
    }

    currentRow.push(field)
    if (currentRow.length === 2) {
      rows.push(currentRow)
      currentRow = []
    }
  }

  if (currentRow.length) {
    rows.push(currentRow)
  }

  return rows
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validateContactFormValues(fields, values, options = {}) {
  const resolved = resolveContactFormFields(fields)

  for (const field of resolved) {
    const value = String(values[field.name] || '').trim()
    if (field.required && !value) {
      return 'Please fill in all required fields.'
    }
  }

  const emailField = resolved.find((field) => field.name === 'email')
  if (emailField) {
    const email = String(values.email || '').trim()
    if (email && !isValidEmail(email)) {
      return 'Please enter a valid email address.'
    }
  }

  if (options.marketingConsentRequired && !options.marketingConsent) {
    return 'Please confirm marketing consent.'
  }

  return null
}

export function buildContactFormSubmission(fields, values) {
  const resolved = resolveContactFormFields(fields)

  return resolved.map((field) => ({
    fieldType: field.fieldType,
    label: field.label,
    name: field.name,
    required: field.required,
    value: String(values[field.name] || '').trim(),
  }))
}

export function getContactFormReplyToEmail(submissionFields) {
  const emailField = submissionFields.find((field) => field.name === 'email')
  return emailField?.value?.trim() || ''
}

export function getContactFormSubjectName(submissionFields) {
  const firstName = submissionFields.find((field) => field.name === 'firstName')?.value?.trim() || ''
  const lastName = submissionFields.find((field) => field.name === 'lastName')?.value?.trim() || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  if (fullName) return fullName

  const email = submissionFields.find((field) => field.name === 'email')?.value?.trim()
  if (email) return email

  return 'New submission'
}
