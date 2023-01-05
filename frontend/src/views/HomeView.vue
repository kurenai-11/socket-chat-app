<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, watch } from "vue";
import io, { Socket } from "socket.io-client";
import type {
  Message,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../utils/types";
import ChatMessage from "@/components/ChatMessage.vue";
import FormInput from "@/components/FormInput.vue";
import NButton from "@/components/NButton.vue";

// creating a socket connection
// I use 192.168.1.200 which is my local lan IP
// you can replace it with http://localhost:5000 or whatever your local ip of the backend is
const rawSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://192.168.1.200:5000",
  { autoConnect: false }
);
// for reactivity purposes
const socket = ref(rawSocket);
const isConnected = computed(() => socket.value.connected);

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
</script>

<template>
  <main class="flex flex-col gap-2 items-center">
    <h1 class="text-xl font-bold">This is the main page.</h1>
    <p>
      Currently you are {{ isConnected ? "connected" : "disconnected" }}
      {{ isConnected ? "to" : "from" }} the chat.
    </p>
    <NButton
      v-if="!isConnected"
      @click="connect"
      additional-classes="font-bold bg-green-8 hover:outline-cyan-9"
      >Connect</NButton
    >
    <div v-if="isConnected" class="flex flex-col items-center gap-2">
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
        />
        <NButton type="submit" additional-classes="w-fit self-center"
          >Submit</NButton
        >
      </form>
      <div class="flex flex-col gap-2 mt-1 mb-4">
        <ChatMessage
          :key="message.id"
          v-for="message of messages"
          :message="message"
        />
      </div>
    </div>
  </main>
</template>
