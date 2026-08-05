<template>
  <DefaultPage
    title="Contact"
    subtitle="Press and booking inquiries."
    wide
  >
    <div class="contact-grid">
      <section class="contact-card">
        <h2>Press</h2>
        <p class="contact-card__name">Anne Takahashi</p>
        <p class="contact-card__detail">anne@takapr.com</p>
        <a href="mailto:anne@takapr.com" class="contact-card__action">Email Press</a>
      </section>

      <section class="contact-card">
        <h2>Bookings</h2>
        <p class="contact-card__name">Screening requests</p>
        <p class="contact-card__detail">bookings@crowsarewhite.com</p>
        <a href="mailto:bookings@crowsarewhite.com" class="contact-card__action">Email Bookings</a>
      </section>
    </div>
  </DefaultPage>
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Contact'

usePageColor(ref(null))
</script>

<style scoped>
.contact-grid {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.contact-card {
  padding: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--text-color, #111010) 14%, transparent);
  background: #fff;
}

.contact-card__name {
  margin: 0;
  font-weight: 600;
}

.contact-card__detail {
  margin: 0.35rem 0 0;
  font-size: 0.925em;
  color: color-mix(in srgb, var(--text-color, #111010) 58%, transparent);
}

.contact-card__action {
  display: inline-block;
  margin-top: 1.25rem;
  padding: 0.65rem 1rem;
  border: 1px solid currentColor;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
  transition: background 0.2s ease, color 0.2s ease;
}

.contact-card__action:hover {
  background: var(--text-color, #111010);
  color: #fff;
}
</style>
