import gsap from 'gsap'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    window.gsap = gsap
  }
})
