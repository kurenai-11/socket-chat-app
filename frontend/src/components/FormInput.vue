<!-- This is a generic FormInput element -->
<script setup lang="ts">
import type { Nullable } from "@/utils/types";
import { twMerge as tw } from "tailwind-merge";
import { ref, type InputHTMLAttributes } from "vue";

export interface CustomInputProps extends InputHTMLAttributes {
  additionalClasses?: string;
  modelValue?: string;
}

const baseClasses =
  "outline-none border-none bg-zinc-9 color-inherit transition-all rounded-lg text-lg py-1 px-3 focus:outline-amber-3";

defineProps<CustomInputProps>();
defineEmits<{ (e: "update:modelValue", val: string): void }>();
const inputRef = ref<Nullable<HTMLInputElement>>(null);
defineExpose({ rawInput: inputRef });
</script>
<template>
  <input
    v-bind="{
      ...$props,
      class: tw(baseClasses, $props.additionalClasses),
      value: $props.modelValue,
    }"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
    ref="inputRef"
  />
</template>
