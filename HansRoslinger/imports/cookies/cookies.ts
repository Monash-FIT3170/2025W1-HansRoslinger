import "react";
import Cookies from "js-cookie";
import { GestureType, FunctionType } from "../gesture/gesture";

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

export function setSettingsCookie(config: Record<GestureType, FunctionType>) {
  Cookies.set("settings", JSON.stringify(config));
}

export function getSettingsCookie() {
  var cookie = Cookies.get("settings");
  if (cookie == null) {
    return {
      [GestureType.THUMB_UP]: FunctionType.UNUSED,
      [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
      [GestureType.POINTING_UP]: FunctionType.SELECT,
      [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
      [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
      [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
      [GestureType.OPEN_PALM]: FunctionType.FILTER,
      [GestureType.VICTORY]: FunctionType.ZOOM,
    };
  } else {
    return JSON.parse(cookie);
  }
}
