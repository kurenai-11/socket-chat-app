<script setup lang="ts">
import { ref } from "vue";
import FormInput from "./FormInput.vue";
import NButton from "./NButton.vue";

// if not, then it is a sign up form
const isLoginForm = ref(true);
</script>
<template>
  <div class="flex flex-col items-center w-84 gap-2">
    <h1 class="font-bold text-xl mt-4 mb-2">
      {{ isLoginForm ? "Login" : "Signup" }}
    </h1>
    <form
      @submit.prevent=""
      class="flex flex-col w-full gap-2 justify-center items-center"
    >
      <FormInput
        additional-classes="w-full"
        :placeholder="isLoginForm ? 'Login' : 'Signup'"
      />
      <FormInput
        additional-classes="w-full"
        type="password"
        placeholder="Password"
      />
      <FormInput
        v-if="!isLoginForm"
        additional-classes="w-full"
        type="password"
        placeholder="Confirm password"
      />
      <NButton additional-classes="w-32 self-center"
        ><v-icon name="md-login" />
        {{ isLoginForm ? "Login" : "Signup" }}</NButton
      >
    </form>
    <NButton
      @click="isLoginForm = !isLoginForm"
      additional-classes="w-32 self-center"
      ><v-icon name="hi-arrow-left" />
      {{ isLoginForm ? "Signup?" : "Login?" }}</NButton
    >
  </div>
</template>
