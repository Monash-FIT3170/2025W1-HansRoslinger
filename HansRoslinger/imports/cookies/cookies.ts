import Cookies from "js-cookie";

const USERID = "user_id";
const AUTHTOKEN = "auth_token";

export function setAuthCookie(token: string, userId: string) {
  Cookies.set(AUTHTOKEN, token, { expires: 1 }); // 1 day
  Cookies.set(USERID, userId, { expires: 1 });
}

export function getAuthCookie() {
  return {
    token: Cookies.get(AUTHTOKEN),
    userId: getUserIDCookie(),
  };
}

export function getUserIDCookie() {
    return Cookies.get(USERID);
}

export function clearAuthCookie() {
  Cookies.remove(AUTHTOKEN);
  Cookies.remove(USERID);
}
