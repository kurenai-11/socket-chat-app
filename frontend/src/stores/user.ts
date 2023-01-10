import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Nullable, User } from "@/utils/types";
import { BACKEND_URL } from "@/utils/constants";

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
  const logout = async () => {
    const response = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: { Authorization: "Bearer " + accessToken.value },
      // fetch doesn't send a post request if there is no body
      body: "",
    });
    user.value = null;
    accessToken.value = null;
    console.log("response :>> ", response);
  };
  return { user, accessToken, isLoggedIn, storeUser, logout };
});
