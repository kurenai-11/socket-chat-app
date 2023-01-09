<script setup lang="ts">
import AuthForm from "@/components/AuthForm.vue";
import { useUserStore } from "@/stores/user";
import { watchEffect } from "vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();
watchEffect(() => {
  userStore.isLoggedIn && router.push("/");
});
</script>
<template>
  <main class="flex flex-col items-center gap-4">
    <AuthForm />
  </main>
</template>
