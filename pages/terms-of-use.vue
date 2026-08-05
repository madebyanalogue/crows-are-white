<template>
  <DefaultPage
    title="Terms &amp; Conditions"
    subtitle="Terms governing use of crowsarewhite.com."
  >
    <section>
      <h2>Acceptance</h2>
      <p>
        By accessing or using this website, you agree to these terms and conditions.
        If you do not agree, please do not use the site.
      </p>
    </section>

    <section>
      <h2>Use of the site</h2>
      <p>
        Content on this site is provided for general information about
        <em>Crows Are White</em>, related screenings, and merchandise.
        You may not copy, scrape, or redistribute site content for commercial use
        without prior written permission.
      </p>
    </section>

    <section>
      <h2>Purchases</h2>
      <p>
        Shop orders are subject to availability, pricing at checkout, and our
        <NuxtLink to="/shipping-delivery">Shipping &amp; Delivery</NuxtLink>
        policy. We reserve the right to refuse or cancel orders where necessary.
      </p>
    </section>

    <section>
      <h2>Third-party links</h2>
      <p>
        Links to theaters, streaming platforms, and other third-party sites are
        provided for convenience. We are not responsible for their content,
        policies, or practices.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent via our
        <NuxtLink to="/contact">contact page</NuxtLink>.
      </p>
    </section>
  </DefaultPage>
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Terms & Conditions'

usePageColor(ref(null))
</script>
