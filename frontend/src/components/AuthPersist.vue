<script setup lang="ts">
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
userStore.persistAuth();
</script>
<template>
  <template></template>
</template>
