<script setup lang="ts">
import { ref } from "vue";
import { twMerge as tw } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/utils/types";
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{ message: Message }>();
const initialDate = new Date(props.message.date);
let refreshIntervalId: number;
const refreshInterval = 5000; // 5 seconds
const getTimeAgo = () => {
  return formatDistanceToNow(initialDate, {
    addSuffix: true,
    includeSeconds: true,
  });
};
const timeAgo = ref(getTimeAgo());
onMounted(() => {
  refreshIntervalId = setInterval(() => {
    console.log("refresh interval");
    timeAgo.value = getTimeAgo();
  }, refreshInterval);
});
onUnmounted(() => {
  console.log("clear interval");
  clearInterval(refreshIntervalId);
});
</script>
<template>
  <div
    :class="
      tw(
        'text-zinc-3 text-center',
        props.message.type === 'serverMessage' && 'text-amber-3 font-bold'
      )
    "
  >
    {{ props.message.content }}
    <span class="text-pink-7" v-if="props.message.type === 'userMessage'"
      >by <span class="text-red-7">{{ props.message.author }}</span></span
    >
    {{ " " }}
    <span class="text-zinc-4 font-normal">{{ timeAgo }}</span>
  </div>
</template>
