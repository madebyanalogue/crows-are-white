<template>
  <section v-if="hasContent">
    <div
      class="team-content section-padding"
      :class="{ 'team-content--no-pad-top': !paddingTop }"
      :style="sectionStyle"
    >
      <div class="wrapper">
        <div class="grid-1 gap-7">
          <div
            v-if="titleBlocks.length || subtitle"
            class="team__header grid-1 gap-3 text-center"
          >
            <div v-if="titleBlocks.length" class="serif h2">
              <SanityContent :blocks="titleBlocks" />
            </div>

            <p v-if="subtitle" class="h5 team__subtitle serif">
              {{ subtitle }}
            </p>
          </div>

          <div
            v-if="members.length"
            class="team__rows grid-1 gap-section"
          >
            <div
              v-for="(row, rowIndex) in memberRows"
              :key="`team-row-${rowIndex}`"
              class="team__row grid-1 gap-4"
            >
              <div class="team__members grid-1 grid-md-3">
                <article
                  v-for="member in row"
                  :key="member._key"
                  class="team__member"
                  @mouseenter="onMemberMouseEnter(member._key)"
                  @mouseleave="onMemberMouseLeave"
                  @focusin="onMemberFocusIn(member._key)"
                  @focusout="onMemberFocusOut"
                >
                  <div
                    v-if="memberImageId(member)"
                    class="team__image"
                  >
                    <AppImage
                      :src="memberImageId(member)"
                      :width="memberImageWidth(member)"
                      :height="memberImageHeight(member)"
                      :alt="memberImageAlt(member)"
                      class="team__img"
                      sizes="third"
                    />
                  </div>

                  <div
                    v-if="member.firstName || member.lastName || member.role"
                    class="team__name-container"
                    :class="{ 'team__name-container--interactive': !isDesktop && hasMemberBio(member) }"
                    :role="!isDesktop && hasMemberBio(member) ? 'button' : undefined"
                    :tabindex="!isDesktop && hasMemberBio(member) ? 0 : undefined"
                    :aria-expanded="!isDesktop && hasMemberBio(member) ? expandedMobileKey === member._key : undefined"
                    @click="onNameContainerClick(member)"
                    @keydown.enter.prevent="onNameContainerClick(member)"
                    @keydown.space.prevent="onNameContainerClick(member)"
                  >
                    <div class="team__name-details">
                      <div
                        v-if="member.firstName || member.lastName"
                        class="team__name serif"
                      >
                        <span v-if="member.firstName">{{ member.firstName }}</span>
                        <em v-if="member.lastName">{{ member.lastName }}</em>
                      </div>

                      <p
                        v-if="member.role"
                        class="team__role serif"
                      >
                        {{ member.role }}
                      </p>
                    </div>

                    <span
                      v-if="!isDesktop && hasMemberBio(member)"
                      class="team__toggle"
                      aria-hidden="true"
                    >
                      <span
                        class="team__toggle-plus"
                        :class="{ 'team__toggle-plus--open': expandedMobileKey === member._key }"
                      >
                        <span class="team__toggle-plus-bar team__toggle-plus-bar--horizontal" />
                        <span class="team__toggle-plus-bar team__toggle-plus-bar--vertical" />
                      </span>
                    </span>
                  </div>

                  <div
                    v-if="hasMemberBio(member)"
                    class="team__bio-mobile serif"
                    :class="{ 'team__bio-mobile--open': !isDesktop && expandedMobileKey === member._key }"
                    :aria-hidden="isDesktop || expandedMobileKey !== member._key"
                  >
                    <div class="team__bio-mobile-inner">
                      <SanityContent
                        v-if="Array.isArray(member.bio)"
                        :blocks="member.bio"
                      />
                      <p v-else>{{ member.bio }}</p>
                      <p>&nbsp;</p>
                    </div>
                  </div>
                </article>
              </div>

              <div
                v-if="isDesktop && rowMembersWithBio(row).length"
                class="team__bio serif"
              >
                <div
                  v-for="member in rowMembersWithBio(row)"
                  :key="member._key"
                  class="team__bio-panel"
                  :class="{ 'team__bio-panel--active': displayedBioKey === member._key && bioVisible }"
                  :aria-hidden="displayedBioKey !== member._key || !bioVisible"
                >
                  <SanityContent
                    v-if="Array.isArray(member.bio)"
                    :blocks="member.bio"
                  />
                  <p v-else>{{ member.bio }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { toCssColor, resolvePageTextColor, DEFAULT_PAGE_COLOR } from '~/utils/pageColors'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const hoveredKey = ref(null)
const displayedBioKey = ref(null)
const bioVisible = ref(false)
const expandedMobileKey = ref(null)
const isDesktop = ref(false)

const BIO_FADE_MS = 250
let bioTransitionId = 0
let desktopMediaQuery = null

function syncDesktop() {
  isDesktop.value = desktopMediaQuery?.matches ?? false
}

onMounted(() => {
  if (!import.meta.client) return

  desktopMediaQuery = window.matchMedia('(min-width: 1000px)')
  syncDesktop()
  desktopMediaQuery.addEventListener('change', syncDesktop)
})

onUnmounted(() => {
  desktopMediaQuery?.removeEventListener('change', syncDesktop)
})

watch(isDesktop, (desktop) => {
  if (desktop) {
    expandedMobileKey.value = null
  } else {
    hoveredKey.value = null
  }
})

const titleBlocks = computed(() => props.section?.teamTitle ?? [])
const subtitle = computed(() => props.section?.teamSubtitle?.trim() || '')
const members = computed(() => props.section?.teamMembers ?? [])
const paddingTop = computed(() => props.section?.teamPaddingTop !== false)

const sectionStyle = computed(() => ({
  '--section-background': toCssColor(props.section?.teamBackgroundColor, DEFAULT_PAGE_COLOR),
  '--section-color': toCssColor(
    resolvePageTextColor(
      props.section?.teamTextColor,
      props.section?.teamBackgroundColor,
    ),
    'obsidian',
  ),
}))

const memberRows = computed(() => {
  const rows = []
  for (let index = 0; index < members.value.length; index += 3) {
    rows.push(members.value.slice(index, index + 3))
  }
  return rows
})

const hasContent = computed(
  () => titleBlocks.value.length > 0 || subtitle.value.length > 0 || members.value.length > 0,
)

function rowMembersWithBio(row) {
  return row.filter(hasMemberBio)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function updateBioDisplay(targetKey) {
  const transitionId = ++bioTransitionId
  const currentKey = displayedBioKey.value

  if (currentKey && bioVisible.value) {
    bioVisible.value = false
    await wait(BIO_FADE_MS)
    if (transitionId !== bioTransitionId) return
  }

  if (!targetKey) {
    displayedBioKey.value = null
    bioVisible.value = false
    return
  }

  if (targetKey !== currentKey) {
    displayedBioKey.value = targetKey
    await nextTick()
    if (transitionId !== bioTransitionId) return
  }

  bioVisible.value = true
}

watch(hoveredKey, (targetKey) => {
  if (!isDesktop.value) return
  updateBioDisplay(targetKey)
})

function onMemberMouseEnter(key) {
  if (!isDesktop.value) return
  hoveredKey.value = key
}

function onMemberMouseLeave() {
  if (!isDesktop.value) return
  hoveredKey.value = null
}

function onMemberFocusIn(key) {
  if (!isDesktop.value) return
  hoveredKey.value = key
}

function onNameContainerClick(member) {
  if (isDesktop.value || !hasMemberBio(member)) return
  expandedMobileKey.value = expandedMobileKey.value === member._key ? null : member._key
}

function hasMemberBio(member) {
  if (!member?.bio) return false
  if (Array.isArray(member.bio)) return member.bio.length > 0
  return Boolean(String(member.bio).trim())
}

function onMemberFocusOut(event) {
  if (!isDesktop.value) return
  const related = event.relatedTarget
  const rowEl = event.currentTarget.closest('.team__row')
  if (related && rowEl?.contains(related)) return
  hoveredKey.value = null
}

function memberImageId(member) {
  return member?.image?.asset?._id || ''
}

function memberImageWidth(member) {
  return member?.image?.asset?.metadata?.dimensions?.width
}

function memberImageHeight(member) {
  return member?.image?.asset?.metadata?.dimensions?.height
}

function memberImageAlt(member) {
  const alt = member?.image?.alt
  if (typeof alt === 'string' && alt.trim()) return alt.trim()

  const name = [member?.firstName, member?.lastName].filter(Boolean).join(' ')
  return name || 'Team member'
}
</script>

<style scoped>

.wrapper {
  max-width: 1660px;
}
.team-content {
  --team-member-padding: calc(var(--gutter) * 2);
  background: var(--section-background);
  color: var(--section-color);
}

.team__name {
  font-size: clamp(24px, var(--h3), 27px);
  line-height: 1.3;
}
.team__role {
  margin: 0;
  font-size: 20px;
}
.team__bio {
  font-size: 21px;
  line-height: 1.5;
}

.team-content--no-pad-top {
  padding-top: 0;
}

.team__subtitle {
  margin: 0;
}

.team__member {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  max-width: 400px;
  margin: 0 auto;
}
.team__members {
  gap: 30px;
}
@media (min-width: 700px) {
.team__members {
  gap: 160px;
}
}

@media (min-width: 1000px) {
  .team__member {
    padding: 0 var(--team-member-padding);
    gap: 30px;
    cursor: pointer;
    max-width: none;
    margin: 0;
  }
  .team__members {
    gap: 0px;
  }
}

.team__image {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.team__img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.team__name {
  margin: 0;
}

.team__name em {
  font-style: italic;
}

.team__name span + em {
  margin-left: 0.2em;
}


.team__bio {
  display: grid;
  margin: 0 auto;
  align-items: start;
  width: 100%;
  padding:0 var(--team-member-padding)
}

.team__bio-panel {
  grid-area: 1 / 1;
  margin: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  max-width: 550px;
}

.team__bio-panel--active {
  opacity: 1;
}

.team__name-container {
  width: 100%;
}

.team__bio-mobile {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.team__bio-mobile--open {
  grid-template-rows: 1fr;
}

.team__bio-mobile-inner {
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 999px) {
  .team__name-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .team__name-container--interactive {
    cursor: pointer;
  }

  .team__bio-mobile {
    font-size: calc(var(--body) * 1.2);
    line-height: 1.5;
  }

 
}

@media (min-width: 1000px) {
  .team__bio-mobile {
    display: none;
  }
}

.team__toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team__toggle-plus {
  position: relative;
  width:25px;
  height: 25px;
  display: block;
}

.team__toggle-plus-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.team__toggle-plus-bar--horizontal {
  width: 100%;
  height: 1px;
}

.team__toggle-plus-bar--vertical {
  width: 1px;
  height: 100%;
  transition: opacity 0.25s ease;
}

.team__toggle-plus--open .team__toggle-plus-bar--vertical {
  opacity: 0;
}
</style>
