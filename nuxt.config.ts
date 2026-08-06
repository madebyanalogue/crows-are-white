const siteUrl = process.env.NUXT_SITE_URL || 'https://crowsarewhite.com'
const siteEnv = process.env.NUXT_SITE_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'

export default defineNuxtConfig({
  compatibilityDate: '2025-06-09',
  devtools: { enabled: false },
  modules: ['@nuxt/image', '@nuxtjs/sitemap', '@nuxtjs/sanity'],
  site: {
    url: siteUrl,
    name: 'Crows Are White',
    env: siteEnv,
    indexable: siteEnv === 'production',
  },
  sitemap: {
    excludeAppSources: ['nuxt:pages'],
    exclude: ['/articles', '/api/**'],
    sources: ['/api/__sitemap__/urls'],
  },
  css: ['~/assets/styles/main.css', '~/assets/css/plyr-custom.css'],
  app: {
    pageTransition: false,
    head: {
      title: 'Crows Are White',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Crows Are White — documentary directed by Ahsen Nadeem. Official film website.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://use.typekit.net', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://use.typekit.net/qfm4jik.css' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Goudy+Bookletter+1911&family=Homemade+Apple&family=Shippori+Mincho&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    contactFormFromEmail: process.env.CONTACT_FORM_FROM_EMAIL || '',
    contactFormToEmail: process.env.CONTACT_FORM_TO_EMAIL || '',
    salesforceClientId: process.env.SALESFORCE_CLIENT_ID || '',
    salesforceClientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
    salesforceUsername: process.env.SALESFORCE_USERNAME || '',
    salesforcePrivateKey: process.env.SALESFORCE_PRIVATE_KEY || '',
    salesforceLoginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
    salesforceLeadCompany: process.env.SALESFORCE_LEAD_COMPANY || 'Crows Are White Website',
    salesforceLeadSource: process.env.SALESFORCE_LEAD_SOURCE || 'Website',
    trustpilotApiKey: process.env.TRUSTPILOT_API_KEY || '',
    trustpilotBusinessUnitId: process.env.TRUSTPILOT_BUSINESS_UNIT_ID || '',
    sanityUseCdn: process.env.SANITY_USE_CDN === 'true',
    shopifyStoreDomain: process.env.NUXT_SHOPIFY_STORE_DOMAIN || '',
    shopifyStorefrontToken: process.env.NUXT_SHOPIFY_STOREFRONT_TOKEN || '',
    mockShopify: process.env.NUXT_MOCK_SHOPIFY === 'true',
    public: {
      shopifyStoreDomain: process.env.NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
      sanity: {
        projectId: process.env.SANITY_PROJECT_ID || process.env.NUXT_SANITY_PROJECT_ID || '11cdscj2',
        dataset: process.env.SANITY_DATASET || process.env.NUXT_SANITY_DATASET || 'production',
        apiVersion: '2025-01-01',
        useCdn: process.env.SANITY_USE_CDN === 'true',
      },
    },
  },
  sanity: {
    projectId: process.env.NUXT_SANITY_PROJECT_ID || '11cdscj2',
    dataset: process.env.NUXT_SANITY_DATASET || 'production',
    apiVersion: '2025-01-01',
    minimal: true,
  },
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    routeRules: {
      '/api/**': {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    },
  },
  image: {
    sanity: {
      projectId: process.env.SANITY_PROJECT_ID || process.env.NUXT_SANITY_PROJECT_ID || '11cdscj2',
      dataset: process.env.SANITY_DATASET || process.env.NUXT_SANITY_DATASET || 'production',
    },
    screens: {
      sm: 640,
      md: 768,
      lg: 1000,
      xl: 1280,
      '2xl': 1536,
    },
  },
  vite: {
    optimizeDeps: {
      include: ['gsap', 'gsap/CustomEase', 'gsap/ScrollTrigger', 'lenis'],
    },
  },
})