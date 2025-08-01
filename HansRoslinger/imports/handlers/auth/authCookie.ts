import Cookies from "js-cookie";

export function setAuthCookie(token: string, userId: string) {
  Cookies.set("auth_token", token, { expires: 1 }); // 1 day
  Cookies.set("user_id", userId, { expires: 1 });
}

export function getAuthCookie() {
  return {
    token: Cookies.get("auth_token"),
    userId: Cookies.get("user_id"),
  };
}

export function clearAuthCookie() {
  Cookies.remove("auth_token");
  Cookies.remove("user_id");
}
