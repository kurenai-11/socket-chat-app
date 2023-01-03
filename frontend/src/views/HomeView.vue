<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import io from "socket.io-client";

type Message = {
  id: string;
  content: string;
  author: string;
  date: string;
};

// creating a socket connection
// I use 192.168.1.200 which is my local lan IP
// you can replace it with http://localhost:5000 or whatever your local ip of the backend is
const socket = ref(io("http://192.168.1.200:5000", { autoConnect: false }));
const isConnected = computed(() => socket.value.connected);

const messages = ref<Message[]>([]);

// methods to coonect or disconnect from the socket
const disconnect = () => {
  socket.value.connected && socket.value.disconnect();
};
const connect = () => {
  socket.value.disconnected && socket.value.connect();
};

// watching connection state
watch(isConnected, () => {
  console.log("socket :>> ", socket.value);
});
// connecting on mount and setting up the events
onMounted(() => {
  socket.value.connect();
  socket.value.on("connected", (message) => {
    console.log("message :>> ", message);
  });
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
        <input type="text" placeholder="your message..." />
        <button>Submit</button>
      </div>
      <div :key="message.date" v-for="message of messages">
        {{ message.content }}
      </div>
    </div>
  </main>
</template>
