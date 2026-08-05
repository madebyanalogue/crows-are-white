// TODO(dev): remove with Sanity field devBackgroundImage before launch
export function usePageDevBackground(page) {
  useHead(() => {
    const url = page.value?.devBackgroundImage?.asset?.url
    if (!url) {
      return {
        bodyAttrs: {
          'data-page-dev-bg': undefined,
          style: undefined,
        },
      }
    }
    return {
      bodyAttrs: {
        'data-page-dev-bg': 'true',
        style: [
          `background-image:url("${url}")`,
          'background-size: var(--wrapper-max-width)',
          'background-position: center top',
          'background-repeat: no-repeat',
        ].join(';'),
      },
    }
  })
}
