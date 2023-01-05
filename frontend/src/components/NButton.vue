<!-- Means Normal Button -->
<script setup lang="ts">
import { twMerge as tw } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "vue";

export interface CustomButtonProps extends ButtonHTMLAttributes {
  additionalClasses?: string;
  // Unocss icon name
  icon?: string;
  // UnoCSS(tailwind) classes ↓
  iconSize?: string;
  additionIconClasses?: string;
}

defineProps<CustomButtonProps>();

const baseClasses =
  "bg-zinc-9 color-inherit cursor-pointer text-lg py-1 px-3 border-none outline-none transition-all rounded-lg hover:(outline-amber-3)";
</script>
<template>
  <button
    v-bind="{
      ...$props,
      class: tw(
        baseClasses,
        icon && `flex items-center justify-center gap-1`,
        $props.additionalClasses
      ),
    }"
  >
    <div
      v-if="icon"
      :class="tw(icon, iconSize ? iconSize : 'w-6 h-6', additionIconClasses)"
    />
    <slot />
  </button>
</template>
