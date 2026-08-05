export default defineNuxtPlugin(() => {
  if (process.server) return

  window.handlePreloaderGatedAnimation = (animationFunction, options = {}) => {
    const {
      element = null,
      waitForScroll = true,
      immediateIfInView = false,
    } = options

    const isElementInView = (el) => {
      if (!el) return false
      const rect = el.getBoundingClientRect()
      const windowHeight = window.innerHeight
      return rect.top < windowHeight * 0.8 && rect.bottom > 0
    }

    const executeAnimation = () => {
      if (immediateIfInView && element && isElementInView(element)) {
        animationFunction()
      } else if (waitForScroll) {
        if (window.gsap && window.gsap.ScrollTrigger) {
          if (element && isElementInView(element)) {
            animationFunction()
          } else {
            const trigger = window.gsap.ScrollTrigger.create({
              trigger: element || document.body,
              start: 'top 80%',
              onEnter: () => {
                animationFunction()
                trigger.kill()
              },
            })
          }
        } else {
          animationFunction()
        }
      } else {
        animationFunction()
      }
    }

    if (!document.body.classList.contains('preloader-complete')) {
      document.addEventListener('preloader-complete', () => {
        executeAnimation()
      }, { once: true })
    } else {
      executeAnimation()
    }
  }
})
