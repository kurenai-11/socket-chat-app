<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

const navLinkClasses =
  "h-full p-4 rounded-lg bg-zinc-7 decoration-none color-inherit font-bold transition-all hover:(text-zinc-1 bg-zinc-9)";
</script>

<template>
  <header>
    <nav class="flex gap-2 py-2 px-1 justify-center">
      <RouterLink :class="navLinkClasses" to="/">Home</RouterLink>
      <RouterLink :class="navLinkClasses" to="/about">About</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
