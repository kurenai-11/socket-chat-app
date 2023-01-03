<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import io from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import { twMerge as tw } from "tailwind-merge";

type UserMessage = {
  type: "userMessage";
  id: string;
  content: string;
  author: string;
  date: string;
};

type ServerMessage = {
  type: "serverMessage";
  id: string;
  content: string;
  date: string;
};

type Message = UserMessage | ServerMessage;

// creating a socket connection
// I use 192.168.1.200 which is my local lan IP
// you can replace it with http://localhost:5000 or whatever your local ip of the backend is
const socket = ref(io("http://192.168.1.200:5000", { autoConnect: false }));
const isConnected = computed(() => socket.value.connected);

const messages = ref<Message[]>([]);
const currentMessage = ref<string>("");
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
    <button @click="connect">Connect</button>
    <div v-if="isConnected" class="flex flex-col items-center gap-2">
      <button @click="disconnect">Disconnect</button>
      <div>
        <input
          v-model="currentMessage"
          type="text"
          placeholder="your message..."
        />
        <button @click="sendMessage">Submit</button>
      </div>
      <div
        :key="message.id"
        v-for="message of messages"
        :class="
          tw(
            'text-zinc-3',
            message.type === 'serverMessage' && 'text-amber-3 font-bold'
          )
        "
      >
        {{ message.content }}
        <span class="text-pink-7" v-if="message.type === 'userMessage'"
          >by <span class="text-red-7">{{ message.author }}</span></span
        >
        {{ " " }}
        <span class="text-zinc-4 font-normal">{{
          formatDistanceToNow(new Date(message.date), { addSuffix: true })
        }}</span>
      </div>
    </div>
  </main>
</template>
