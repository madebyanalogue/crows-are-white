<template>
  <DefaultPage
    title="Shipping &amp; Delivery"
    subtitle="How we ship official Crows Are White merchandise."
  >
    <section>
      <h2>Processing</h2>
      <p>
        Orders are typically processed within 2–3 business days. You will receive a
        confirmation email when your order ships.
      </p>
    </section>

    <section>
      <h2>Domestic shipping</h2>
      <p>
        Standard shipping within the United States usually arrives in 5–7 business days
        after dispatch. Expedited options may be available at checkout.
      </p>
    </section>

    <section>
      <h2>International</h2>
      <p>
        International delivery times vary by destination. Customs duties and import taxes
        may apply and are the responsibility of the recipient.
      </p>
    </section>

    <section>
      <h2>Questions</h2>
      <p>
        For order support, visit our
        <NuxtLink to="/faq">FAQ</NuxtLink>
        or
        <NuxtLink to="/contact">contact us</NuxtLink>.
      </p>
    </section>
  </DefaultPage>
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Shipping & Delivery'

usePageColor(ref(null))
</script>
