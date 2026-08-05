<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="section-process section-padding"
  >
    <div class="wrapper">
      <div class="section-process__layout gap-6 gap-sm-6 gap-md-10">
        <div v-if="titleBlocks.length" class="section-process__title-col">
          <h2 class="h3 serif section-process__title">
            <SanityInline :blocks="titleBlocks" />
          </h2>
        </div>

        <ol
          v-if="steps.length"
          class="section-process__steps"
        >
          <li
            v-for="(step, index) in steps"
            :key="step._key"
            class="section-process__step"
            :style="{ '--step-index': index }"
          >
            <span class="section-process__square" aria-hidden="true" />
            <div class="section-process__content grid-1 gap-20">
              <h3 v-if="step.title" class="h5 section-process__step-title">
                {{ step.title }}
              </h3>
              <SanityContent
                v-if="hasStepDescription(step)"
                :blocks="step.description"
                class="section-process__step-description max-width-medium"
              />
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const titleBlocks = computed(() => props.section?.processTitle ?? [])
const steps = computed(() => props.section?.processSteps ?? [])

const hasContent = computed(
  () => titleBlocks.value.length > 0 || steps.value.length > 0,
)

function hasStepDescription(step) {
  return Array.isArray(step?.description) && step.description.length > 0
}

const sectionRef = ref(null)
let inViewObserver = null

onMounted(() => {
  if (!import.meta.client || !sectionRef.value) return

  const section = sectionRef.value

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  // Gate the animated (hidden) start state behind a class so content stays
  // visible if JS never runs.
  section.classList.add('is--process-ready')

  // Toggle `in-view` whenever any part of the section (its top or bottom)
  // is within the viewport, so the CSS reveal can play and replay.
  inViewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        section.classList.toggle('in-view', entry.isIntersecting)
      })
    },
    { threshold: 0 },
  )

  inViewObserver.observe(section)
})

onUnmounted(() => {
  inViewObserver?.disconnect()
  inViewObserver = null
})
</script>

<style scoped>
.section-process__layout {
  align-items: start;
  display:grid;
  grid-template-columns: 1fr;
}
.section-process__title {
  line-height: 1.25;
}

.section-process__steps {
  --marker-size: 8px;
  --marker-gap: 0;
  --step-gap: calc(var(--unit) * 5);
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
}

.section-process__step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: calc(calc(calc(var(--marker-size) * 0.5) + var(--marker-gap)) * -1);
  top: calc(var(--marker-size) / 1);
  height: calc(100% + calc(var(--step-gap)) + calc(calc(var(--marker-size) * 0.5)));
  width: 1px;
  background: currentColor;
  transform: translateX(-50%) scaleY(1);
  transform-origin: center top;
  opacity: .2;
}

.section-process__step {
  position: relative;
  display: grid;
  gap: var(--step-gap);
  align-items: center;
  justify-content: center;
  padding-left: calc(var(--unit) * 3);
}

.section-process__step + .section-process__step {
  margin-top: var(--step-gap);
}

.section-process__square {
  position: absolute;
  left: 0;
  transform: translateX(-50%);
  top: 0.5em;
  width: var(--marker-size);
  height: var(--marker-size);
  background: currentColor;
  z-index: 1;
}

.section-process__content {
  display: flex;
  flex-direction: column;
}

.section-process__step-title {
  margin: 0;
}

@media (min-width: 700px) {
.section-process__step {
  padding-left: calc(var(--unit) * 3);
}
}
@media (min-width: 1000px) {
  .section-process__title {
    position: sticky;
    top: calc(calc(var(--header-height) * 1px) + var(--section-padding));
  }
  .section-process__steps {
  --step-gap: calc(var(--unit) * 8);
  }
}
@media (min-width: 1200px) {
  .section-process__steps {
  --step-gap: calc(var(--unit) * 5);
  max-width:unset;
  margin:0;
  }
  .section-process__layout {
    grid-template-columns: 1fr 1fr;
    gap:0;
    max-width:unset;
  }
  .section-process__title {
    max-width: 550px;
  }
  /* .section-process__content {
    max-width: 500px;
  } */
  .section-process__step {
    padding:0 calc(var(--unit) * 8);
  }
  .section-process__title-col {
    padding:0 calc(var(--unit) * 6);
  }
  .section-process__steps {
    margin-top: 20px;
  }
}


/* ------------------------------------------------------------------ */
/* Scroll reveal: `in-view` is toggled on the section by an observer,  */
/* CSS handles the staggered animation of each element per step.       */
/* ------------------------------------------------------------------ */
.section-process__step {
  --step-index: 0;
  --step-delay: calc(var(--step-index) * 1s);
  --animation-duration: 1s;
}

.section-process.is--process-ready .section-process__title,
.section-process.is--process-ready .section-process__square,
.section-process.is--process-ready .section-process__step-title,
.section-process.is--process-ready .section-process__step-description,
.section-process.is--process-ready .section-process__step:not(:last-child)::before {
  transition-property: opacity, transform;
  transition-duration: var(--animation-duration);
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Hidden start state while the reveal is armed but not yet in view */
.section-process.is--process-ready:not(.in-view) .section-process__title {
  opacity: 0;
  transform: translateY(20px);
}
.section-process.is--process-ready:not(.in-view) .section-process__square {
  opacity: 0;
  transform: translateX(-50%) scale(0);
}
.section-process.is--process-ready:not(.in-view) .section-process__step:not(:last-child)::before {
  opacity: 0;
  transform: translateX(-50%) scaleY(0);
}
.section-process.is--process-ready:not(.in-view) .section-process__step-title,
.section-process.is--process-ready:not(.in-view) .section-process__step-description {
  opacity: 0;
  transform: translateY(20px);
}

/* Staggered reveal per element, offset again per step, once in view */
.section-process.is--process-ready.in-view .section-process__square {
  transition-delay: var(--step-delay);
}
.section-process.is--process-ready.in-view .section-process__step:not(:last-child)::before {
  transition-delay: calc(var(--step-delay) + .48s);
  transition-duration: var(--animation-duration);
}
.section-process.is--process-ready.in-view .section-process__step-title {
  transition-delay: calc(var(--step-delay) + 0.16s);
}
.section-process.is--process-ready.in-view .section-process__step-description {
  transition-delay: calc(var(--step-delay) + 0.26s);
}
</style>
