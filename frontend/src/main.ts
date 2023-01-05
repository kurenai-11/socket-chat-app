import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { HiLogin, HiArrowLeft } from "oh-vue-icons/icons";

addIcons(HiLogin, HiArrowLeft);

import "reset.css";
import "virtual:uno.css";
import "./assets/base.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.component("v-icon", OhVueIcon);

app.mount("#app");
