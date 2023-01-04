<script setup lang="ts">
import { twMerge as tw } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/utils/types";
defineProps<{ message: Message }>();
</script>
<template>
  <div
    :class="
      tw(
        'text-zinc-3 text-center',
        message.type === 'serverMessage' && 'text-amber-3 font-bold'
      )
    "
  >
    {{ message.content }}
    <span class="text-pink-7" v-if="message.type === 'userMessage'"
      >by <span class="text-red-7">{{ message.author }}</span></span
    >
    {{ " " }}
    <span class="text-zinc-4 font-normal">{{
      formatDistanceToNow(new Date(message.date), { addSuffix: true })
    }}</span>
  </div>
</template>
