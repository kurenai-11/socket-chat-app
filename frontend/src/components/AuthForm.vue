<script setup lang="ts">
import { BACKEND_URL } from "@/utils/constants";
import { useUserStore } from "@/stores/user";
import type { User } from "@/utils/types";
import { ref } from "vue";
import FormInput from "./FormInput.vue";
import NButton from "./NButton.vue";

// if not, then it is a sign up form
const isLoginForm = ref(true);

const login = ref("");
const password = ref("");
const confirmPassword = ref<string | undefined>(undefined);

const switchFormsHandler = () => {
  login.value = "";
  password.value = "";
  confirmPassword.value = "";
  isLoginForm.value = !isLoginForm.value;
};
const submitHandler = async (action: "login" | "signup") => {
  if (!login.value || !password.value) return;
  const res = await fetch(`${BACKEND_URL}/auth`, {
    method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      action,
      login: login.value,
      password: password.value,
    }),
  });
  if (res.status !== 200) {
    console.log("login error: " + res.status);
    return;
  }
  const authData: { accessToken: string; status: "success"; user: User } =
    await res.json();
  const userStore = useUserStore();
  userStore.storeUser(authData);
};
</script>
<template>
  <div class="flex flex-col items-center w-84 gap-2">
    <h1 class="font-bold text-xl mt-4 mb-2">
      {{ isLoginForm ? "Login" : "Signup" }}
    </h1>
    <form
      @submit.prevent="submitHandler(isLoginForm ? 'login' : 'signup')"
      class="flex flex-col w-full gap-2 justify-center items-center"
      v-auto-animate
    >
      <FormInput
        additional-classes="w-full"
        placeholder="Login"
        v-model="login"
      />
      <FormInput
        additional-classes="w-full"
        type="password"
        placeholder="Password"
        v-model="password"
      />
      <FormInput
        v-if="!isLoginForm"
        additional-classes="w-full"
        type="password"
        placeholder="Confirm password"
        v-model="confirmPassword"
      />
      <NButton
        additional-classes="w-32 self-center"
        icon="i-ion-log-in-outline"
      >
        {{ isLoginForm ? "Login" : "Signup" }}</NButton
      >
    </form>
    <NButton
      @click="switchFormsHandler"
      additional-classes="w-32 self-center"
      icon="i-ion-arrow-back-outline"
      icon-size="w-5 h-5"
    >
      {{ isLoginForm ? "Signup?" : "Login?" }}</NButton
    >
  </div>
</template>
