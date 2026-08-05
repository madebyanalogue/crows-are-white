<template>
  <DefaultPage
    title="Legals &amp; Credits"
    subtitle="Privacy policy, terms of use, and film credits."
  >
    <section>
      <h2>Privacy Policy</h2>
      <p>
        <NuxtLink to="/privacy-policy">Read the full privacy policy</NuxtLink>
      </p>
    </section>

    <section>
      <h2>Terms of Use</h2>
      <p>
        <NuxtLink to="/terms-of-use">Read the full terms of use</NuxtLink>
      </p>
    </section>

    <section>
      <h2>Credits</h2>
      <p>
        <NuxtLink to="/credits">View full credits</NuxtLink>
      </p>
    </section>
  </DefaultPage>
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Legals & Credits'

usePageColor(ref(null))
</script>
