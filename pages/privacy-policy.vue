<template>
  <DefaultPage
    title="Privacy Policy"
    subtitle="How we collect, use, and protect your information."
  >
    <section>
      <h2>Overview</h2>
      <p>
        This privacy policy explains how Crows Are White collects, uses, and protects
        personal information when you visit crowsarewhite.com, sign up for updates,
        contact us, or make a purchase from our shop.
      </p>
    </section>

    <section>
      <h2>Information we collect</h2>
      <p>
        We may collect information you provide directly, such as your name, email address,
        and message content when you use our contact form or subscribe to our newsletter.
        When you place a shop order, payment and fulfilment details are handled by our
        ecommerce provider.
      </p>
    </section>

    <section>
      <h2>How we use your information</h2>
      <p>
        We use your information to respond to enquiries, send updates you have requested,
        process orders, improve the website, and comply with legal obligations. We do not
        sell your personal information.
      </p>
    </section>

    <section>
      <h2>Cookies &amp; analytics</h2>
      <p>
        We may use cookies and similar technologies to understand how visitors use the site
        and to improve performance. You can control cookies through your browser settings.
      </p>
    </section>

    <section>
      <h2>Third-party services</h2>
      <p>
        We work with trusted third-party providers for email, analytics, ticketing,
        streaming, and ecommerce. Those providers process data according to their own
        privacy policies.
      </p>
    </section>

    <section>
      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, or delete
        personal information we hold about you. To make a request, please
        <NuxtLink to="/contact">contact us</NuxtLink>.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent via our
        <NuxtLink to="/contact">contact page</NuxtLink>.
      </p>
    </section>
  </DefaultPage>
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Privacy Policy'

usePageColor(ref(null))
</script>
