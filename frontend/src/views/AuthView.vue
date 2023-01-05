<script setup lang="ts">
import BaseForm from "@/components/BaseForm.vue";
import { ref } from "vue";

const loginForm = ref(true);
</script>
<template>
  <main class="flex flex-col items-center gap-4">
    <h1 class="font-bold text-xl mt-4">Login</h1>
    <component :is="loginForm ? BaseForm : BaseForm" />
  </main>
</template>
