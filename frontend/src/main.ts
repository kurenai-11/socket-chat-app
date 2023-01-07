import { createApp } from "vue";
import { createPinia } from "pinia";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

import App from "./App.vue";
import router from "./router";

import "reset.css";
import "virtual:uno.css";
import "./assets/base.css";

// url of the backend, usually it is localhost:5000, but I used
// my lan ip
export const BACKEND_URL = "http://192.168.1.200";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(autoAnimatePlugin);

app.mount("#app");
