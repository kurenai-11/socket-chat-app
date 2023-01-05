<script setup lang="ts">
import FormInput from "./FormInput.vue";
import NButton from "./NButton.vue";
</script>
<template>
  <div class="flex flex-col w-84 gap-2">
    <form
      @submit.prevent=""
      class="flex flex-col gap-2 justify-center items-center"
    >
      <FormInput additional-classes="w-full" placeholder="Login" />
      <FormInput
        additional-classes="w-full"
        type="password"
        placeholder="Password"
      />
      <NButton additional-classes="w-fit self-center"
        ><v-icon name="hi-login" /> Login</NButton
      >
    </form>
    <NButton
      @click="$emit('change-form')"
      additional-classes="w-fit self-center"
      ><v-icon name="hi-arrow-left" /> Signup?</NButton
    >
  </div>
</template>
