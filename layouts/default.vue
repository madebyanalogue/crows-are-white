<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="flex-1">
      <div class="site-wrap">
        <slot />
      </div>
    </main>

    <AppFooter />
  </div>
</template>
