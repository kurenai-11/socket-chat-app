<script setup lang="ts">
import { RouterLink } from "vue-router";
const navLinkClasses =
  "h-full p-4 rounded-lg bg-zinc-7 decoration-none color-inherit font-bold transition-all hover:(text-zinc-1 bg-zinc-9)";
</script>
<template>
  <header>
    <nav class="flex flex-col gap-2 py-2 px-1 items-center font-sans">
      <div class="flex items-center gap-2">
        <RouterLink :class="navLinkClasses" to="/">Home</RouterLink>
        <RouterLink :class="navLinkClasses" to="/about">About</RouterLink>
      </div>
      <RouterLink :class="navLinkClasses" to="/auth">Login / Signup</RouterLink>
    </nav>
  </header>
</template>
