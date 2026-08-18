<script setup>
import {
  isShopCollectionHandle,
  resolveShopFilterId,
  shopFilterQueryValue,
} from '~/utils/shopCollections'

const route = useRoute()
const handle = String(route.params.handle || '')

if (!isShopCollectionHandle(handle) && handle !== 'prints') {
  throw createError({statusCode: 404, statusMessage: 'Collection not found'})
}

// Keep old collection URLs working, but stay on /shop for in-place filtering.
await navigateTo(
  {
    path: '/shop',
    query: {filter: shopFilterQueryValue(resolveShopFilterId(handle))},
  },
  {redirectCode: 301, replace: true},
)
</script>
