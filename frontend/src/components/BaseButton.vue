<script setup lang="ts">
import { twMerge as tw } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "vue";

export interface CustomProps {
  additionalClasses?: string;
}

// workaround for https://github.com/vuejs/core/issues/4294
export interface CustomButtonProps extends ButtonHTMLAttributes, CustomProps {}

const props = defineProps<CustomButtonProps>();
const emit = defineEmits<{
  (e: "clicked", mouseEvent: MouseEvent): void;
}>();

const baseClasses =
  "bg-zinc-9 color-inherit text-lg py-1 px-3 border-none outline-none transition-all rounded-lg hover:(outline-amber-3)";
</script>
<template>
  <button
    v-bind="{ ...props, class: tw(baseClasses, props.additionalClasses) }"
    @click="emit('clicked', $event)"
  >
    <slot />
  </button>
</template>
