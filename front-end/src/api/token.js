const TOKEN = import.meta.env.VITE_LOCAL_STORAGE_ITEM_NAME || "anime_token";
const REFRESH_TOKEN = "anime_refresh";
const USER_KEY = "anime_user";

export function setToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN, token);
  } else {
    window.localStorage.removeItem(TOKEN);
  }
}

export function getToken() {
  return window.localStorage.getItem(TOKEN);
}

export function removeToken() {
  window.localStorage.removeItem(TOKEN);
  window.localStorage.removeItem(REFRESH_TOKEN);
  window.localStorage.removeItem(USER_KEY);
}
