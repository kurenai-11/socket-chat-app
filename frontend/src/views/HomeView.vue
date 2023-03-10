<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  watch,
  watchEffect,
} from "vue";
import io, { Socket } from "socket.io-client";
import type {
  Message,
  ServerToClientEvents,
  ClientToServerEvents,
  Nullable,
} from "@/utils/types";
import ChatMessage from "@/components/ChatMessage.vue";
import FormInput from "@/components/FormInput.vue";
import NButton from "@/components/NButton.vue";
import { BACKEND_URL } from "@/utils/constants";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
// creating a socket connection
const rawSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  BACKEND_URL,
  {
    autoConnect: false,
    auth: { accessToken: userStore.accessToken },
  }
);
// for reactivity purposes
const socket = ref(rawSocket);
const isConnected = computed(() => socket.value.connected);

const messageInput = ref<Nullable<{ rawInput: HTMLInputElement }>>();
const messages = ref<Message[]>([]);
const currentMessage = ref("");
const addReceivedMessage = (message: Message) => {
  messages.value.unshift(message);
};
const sendMessage = () => {
  if (currentMessage.value.length === 0) {
    return;
  }
  socket.value.emit("send message", {
    content: currentMessage.value,
  });
  currentMessage.value = "";
};

// methods to connect or disconnect from the socket
const disconnect = () => {
  isConnected.value && socket.value.disconnect();
  // clear local messages
  messages.value = [];
};
const connect = () => {
  !isConnected.value && socket.value.connect();
};

// focusing the message input when it is ready
watchEffect(() => {
  if (!messageInput.value) return;
  messageInput.value.rawInput.focus();
});
// watching if user logs out on the main page through the navbar
watch(
  () => userStore.isLoggedIn,
  () => {
    // only when the user logs out
    if (!userStore.isLoggedIn) {
      socket.value.auth = {};
      disconnect();
      connect();
    }
  }
);
// connecting on mount and setting up the events
onMounted(async () => {
  await userStore.persistAuth();
  // after the await, the store data is fully updated
  // if auth persisted, set the socket auth data to the newly acquired access token
  if (userStore.accessToken) {
    socket.value.auth = { accessToken: userStore.accessToken };
  }
  socket.value.connect();
  const addMessageEvents = [
    "user connected",
    "user disconnected",
    "message sent",
  ] as const;
  for (const messageEvent of addMessageEvents) {
    socket.value.on(messageEvent, (message) => {
      addReceivedMessage(message);
    });
  }
});
onUpdated(() => {
  // making a hardcoded limit to the number of messages
  // only the recent messages will be shown
  messages.value.length > 30 && messages.value.pop();
});
onUnmounted(() => {
  // socket should disconnect itself automatically
  // but just in case let's disconnect it manually as well
  isConnected.value && socket.value.disconnect();
});
</script>

<template>
  <main class="flex flex-col gap-2 items-center mx-4" v-auto-animate>
    <h1 class="text-xl font-bold">This is the main page.</h1>
    <p class="text-center mb-1">
      Currently you are {{ isConnected ? "connected" : "disconnected" }}
      {{ isConnected ? "to" : "from" }} the chat as
      <span class="font-bold text-red-6">{{
        userStore.isLoggedIn ? userStore.user?.username : "Anonymous user"
      }}</span
      >.
    </p>
    <NButton
      v-if="!isConnected"
      @click="connect"
      additional-classes="font-bold bg-green-8 hover:outline-cyan-9"
      >Connect</NButton
    >
    <div v-else class="flex flex-col items-center gap-2">
      <NButton
        @click="disconnect"
        additional-classes="mb-1 text-zinc-1 font-bold bg-[#78222b] hover:outline-orange-7"
        >Disconnect</NButton
      >
      <form
        @submit.prevent="sendMessage"
        class="flex w-full flex-col gap-2 sm:(flex-row)"
      >
        <FormInput
          placeholder="Your message..."
          additional-classes="sm:(min-w-120)"
          v-model="currentMessage"
          ref="messageInput"
        />
        <NButton
          type="submit"
          additional-classes="w-fit self-center"
          icon="i-ion-arrow-forward-circle-outline"
          icon-size="w-5 h-5"
        >
          Submit</NButton
        >
      </form>
      <div v-auto-animate class="flex flex-col gap-2 mt-1 mb-4">
        <ChatMessage
          :key="message.id"
          v-for="message of messages"
          :message="message"
        />
      </div>
    </div>
  </main>
</template>
