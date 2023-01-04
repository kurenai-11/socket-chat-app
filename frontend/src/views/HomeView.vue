<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import io from "socket.io-client";
import type { Message } from "../utils/types";
import ChatMessage from "@/components/ChatMessage.vue";
import FormInput from "@/components/FormInput.vue";
import NButton from "@/components/NButton.vue";

// creating a socket connection
// I use 192.168.1.200 which is my local lan IP
// you can replace it with http://localhost:5000 or whatever your local ip of the backend is
const socket = ref(io("http://192.168.1.200:5000", { autoConnect: false }));
const isConnected = computed(() => socket.value.connected);

const messages = ref<Message[]>([]);
const currentMessage = ref("");
const addReceivedMessage = (message: Message) => {
  messages.value.unshift(message);
};
const sendMessage = () => {
  socket.value.emit("send message", {
    content: currentMessage.value,
    author: "anonymous",
  });
  currentMessage.value = "";
};

// methods to connect or disconnect from the socket
const disconnect = () => {
  isConnected.value && socket.value.disconnect();
};
const connect = () => {
  !isConnected.value && socket.value.connect();
};

// watching connection state
watch(isConnected, () => {
  console.log("socket :>> ", socket.value);
});
// connecting on mount and setting up the events
onMounted(() => {
  socket.value.connect();
  const addMessageEvents = [
    "user connected",
    "user disconnected",
    "message sent",
  ] as const;
  for (const messageEvent of addMessageEvents) {
    socket.value.on(messageEvent, (message: Message) => {
      addReceivedMessage(message);
    });
  }
});
</script>

<template>
  <main class="flex flex-col gap-2 items-center">
    <h1 class="text-xl font-bold">This is the main page.</h1>
    <p>
      Currently you are {{ isConnected ? "connected" : "disconnected" }}
      {{ isConnected ? "to" : "from" }} the chat.
    </p>
    <NButton v-if="!isConnected" @click="connect">Connect</NButton>
    <div v-if="isConnected" class="flex flex-col items-center gap-2">
      <NButton @click="disconnect">Disconnect</NButton>
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <FormInput placeholder="Your message..." v-model="currentMessage" />
        <NButton type="submit">Submit</NButton>
      </form>
      <div class="flex flex-col gap-2">
        <ChatMessage
          :key="message.id"
          v-for="message of messages"
          :message="message"
        />
      </div>
    </div>
  </main>
</template>
