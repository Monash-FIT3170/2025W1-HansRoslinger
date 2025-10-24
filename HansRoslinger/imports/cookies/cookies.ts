import "react";
import Cookies from "js-cookie";

// Cookie keys
const USERID = "user_id";
const AUTHTOKEN = "auth_token";

// Set authentication cookies for 1 day
export function setAuthCookie(token: string, userId: string) {
  Cookies.set(AUTHTOKEN, token, { expires: 1 }); // Auth token
  Cookies.set(USERID, userId, { expires: 1 }); // User ID
}

// Retrieve authentication cookies
export function getAuthCookie() {
  return {
    token: Cookies.get(AUTHTOKEN),
    userId: getUserIDCookie(),
  };
}

// Get only the User ID cookie
export function getUserIDCookie() {
  return Cookies.get(USERID);
}

// Clear authentication cookies (logout)
export function clearAuthCookie() {
  Cookies.remove(AUTHTOKEN);
  Cookies.remove(USERID);
}
