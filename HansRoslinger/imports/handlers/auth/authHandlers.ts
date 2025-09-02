import {
  correctLogin,
  createUser,
  doesUserExist,
  getUserByEmail,
} from "../../api/database/users/users";
import {
  validateEmail,
  validatePassword,
  hashPassword,
} from "../../api/database/users/util";
import jwt from "jsonwebtoken";
const { sign } = jwt;
import type { User } from "../../api/database/users/users";
import { generateJWT } from "./authToken";
import { FunctionType, GestureType } from "/imports/gesture/gesture";

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  if (!(await correctLogin(email, password))) {
    return { success: false, message: "Username or password is incorrect" };
  }
  // Get user to retrieve _id
  const user = (await getUserByEmail(email)) as User & { _id?: string };
  if (!user || !user._id) {
    return { success: false, message: "User not found after login." };
  }
  // Generate JWT valid for 1 day
  const token = generateJWT(user._id);
  return { success: true, message: "user logged in", token, userId: user._id };
};

// Registration handler
export const registerUser = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, message: String(emailValidation.message) };
    }
    const userExists = await doesUserExist(email);
    if (userExists) {
      return {
        success: false,
        message: "An account already exists with that email",
      };
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, message: String(passwordValidation.message) };
    }

    const hashedPassword = await hashPassword(password);
    const userId = await createUser({
      email: email,
      password: hashedPassword,
      createdAt: new Date(),
      settings: {
        [GestureType.THUMB_UP]: FunctionType.UNUSED,
        [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
        [GestureType.POINTING_UP]: FunctionType.SELECT,
        [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
        [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
        [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
        [GestureType.OPEN_PALM]: FunctionType.FILTER,
        [GestureType.VICTORY]: FunctionType.ZOOM,
      },
    });

    // Generate JWT valid for 1 day
    const token = sign({ userId, email }, "dev_secret", { expiresIn: "1d" });

    return {
      success: true,
      message: `Registered user ${email}`,
      token,
      userId,
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Registration failed." };
  }
};
