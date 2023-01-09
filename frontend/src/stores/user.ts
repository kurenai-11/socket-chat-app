import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Nullable, User } from "@/utils/types";

export const useUserStore = defineStore("user", () => {
  const user = ref<Nullable<User>>(null);
  const accessToken = ref<Nullable<string>>(null);
  const isLoggedIn = computed(() => user.value !== null);
  const storeUser = (authData: { user: User; accessToken?: string }) => {
    // we shouldn't call storeUser if we don't have
    // accessToken in the first place, but to be sure
    if (!authData.accessToken) return;
    // storing accessToken only in memory
    accessToken.value = authData.accessToken;
    delete authData.accessToken;
    user.value = authData.user;
  };
  const logout = () => {
    user.value = null;
    accessToken.value = null;
    // todo: delete cookies and make a request to the server
    // to blacklist the refresh token
  };
  return { user, accessToken, isLoggedIn, storeUser, logout };
});
