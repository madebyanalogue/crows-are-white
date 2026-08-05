<template>
  <section v-if="hasContent">
    <div class="contact-information-content section-padding">
      <div class="wrapper">
        <div class="grid-1 gap-section">
          <div
            v-if="titleBlocks.length || subtitle"
            class="contact-information__header grid-1 gap-3 text-center"
          >
            <div v-if="titleBlocks.length" class="serif h2">
              <SanityContent :blocks="titleBlocks" />
            </div>

            <p v-if="subtitle" class="h5 contact-information__subtitle serif">
              {{ subtitle }}
            </p>
          </div>

          <div
            v-if="items.length"
            class="contact-information__items grid-1"
          >
            <template
              v-for="(item, index) in items"
              :key="item._key"
            >
              <hr
                v-if="index > 0"
                class="page-content__divider"
              />
              <div class="contact-information__item">
                <div v-if="item.title">
                  <div class="grid-1 gap-1">
                    <h3 class="h4">{{ item.title }}</h3>
                    <div v-if="hasItemDescription(item)">
                      <SanityContent
                        v-if="Array.isArray(item.description)"
                        :blocks="item.description"
                        class="max-width-medium"
                      />
                      <p v-else>{{ item.description }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="hasContactLink(item)">
                  <MenuLink
                    :item="toMenuItem(item)"
                    :show-arrow="false"
                    class="menu-link--underline h5 "
                  />
                </div>
              </div>
            </template>
            <hr class="page-content__divider" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { whatsappUrl } = useSiteSettings()
const { getMenuItemUrl } = useMenuLinks()

const titleBlocks = computed(() => props.section?.contactInformationTitle ?? [])
const subtitle = computed(() => props.section?.contactInformationSubtitle?.trim() || '')
const items = computed(() => props.section?.contactInformationItems ?? [])

const hasContent = computed(
  () => titleBlocks.value.length > 0 || Boolean(subtitle.value) || items.value.length > 0,
)

function hasItemDescription(item) {
  if (!item?.description) return false
  if (Array.isArray(item.description)) return item.description.length > 0
  return Boolean(String(item.description).trim())
}

function toMenuItem(item) {
  return {
    _key: item._key,
    text: item.linkText,
    link: item.link,
  }
}

function hasContactLink(item) {
  if (!item?.linkText || !item?.link?.type) return false
  if (item.link.type === 'whatsapp') return Boolean(whatsappUrl.value)
  if (item.link.type === 'contactForm') return true

  const href = getMenuItemUrl(toMenuItem(item))
  return Boolean(href && href !== '#')
}
</script>

<style scoped>
.contact-information-content {
  padding-top: calc(var(--section-padding) * 1.25);
  padding-bottom: calc(var(--section-padding) * 1.25);
}

.contact-information__subtitle {
  margin: 0;
}

.contact-information__items:has(.menu-link:hover) :deep(.menu-link) {
  opacity: 0.2;
}

.contact-information__items:has(.menu-link:hover) :deep(.menu-link:hover) {
  opacity: 1;
}
.contact-information__items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding:1.1em 0;
}
.contact-information__items hr:last-of-type {
  display: none;
}

.contact-information__items > * {
  width: 100%;
  max-width: 1200px;
}
.contact-information__item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 1.5rem;
  width: 100%;
 min-height: calc(var(--unit) * 5);
}
.contact-information__item > *:first-child {
  flex: 1;
}
.contact-information__item .h4 {
  font-size: clamp(20px, 2.5vw, 30px);
}
  
@media (min-width: 700px) {
  .contact-information__item {
    flex-direction: row;
  }
  .max-width-medium {
    max-width: 380px;
  }
  .contact-information__item {
  align-items: center;
  }
}

</style>
