import { correctLogin, createUser, doesUserExist, getUserByEmail } from "../../api/database/users/users";
import { validateEmail, validatePassword, hashPassword } from "../../api/database/users/util";
import jwt from "jsonwebtoken";
const { sign } = jwt;
import type { User } from "../../api/database/users/users";
import { generateJWT } from "./authToken";
import { FunctionType, GestureType, defaultMapping } from "/imports/gesture/gesture";

/**
 * Handles user login.
 * - Checks required fields.
 * - Verifies credentials via `correctLogin`.
 * - Retrieves user info from DB.
 * - Generates JWT token for authenticated sessions.
 */
export const loginUser = async (email: string, password: string) => {
  // Validate input
  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  // Check if login credentials are correct
  if (!(await correctLogin(email, password))) {
    return { success: false, message: "Username or password is incorrect" };
  }

  // Fetch user from DB to get _id
  const user = (await getUserByEmail(email)) as User & { _id?: string };
  if (!user || !user._id) {
    return { success: false, message: "User not found after login." };
  }

  // Generate JWT valid for 1 day
  const token = generateJWT(user._id);

  return {
    success: true,
    message: "User logged in",
    token,
    userId: user._id,
  };
};

/**
 * Handles user registration.
 * Steps:
 * 1. Validate required fields.
 * 2. Validate email and password formats.
 * 3. Check for existing user.
 * 4. Hash password and create user in DB.
 * 5. Generate JWT for new user session.
 */
export const registerUser = async (email: string, password: string) => {
  try {
    // Step 1: Required fields
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    // Step 2: Validate email
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, message: String(emailValidation.message) };
    }

    // Step 3: Check if user already exists
    const userExists = await doesUserExist(email);
    if (userExists) {
      return { success: false, message: "An account already exists with that email" };
    }

    // Step 4: Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, message: String(passwordValidation.message) };
    }

    // Step 5: Hash password
    const hashedPassword = await hashPassword(password);

    // Step 6: Create user in DB
    const userId = await createUser({
      email: email,
      password: hashedPassword,
      createdAt: new Date(),
      settings: defaultMapping, // Assign default gesture-function mapping for new users
    });

    // Step 7: Generate JWT valid for 1 day
    const token = sign({ userId, email }, "dev_secret", { expiresIn: "1d" });

    return {
      success: true,
      message: `Registered user ${email}`,
      token,
      userId,
    };
  } catch (err) {
    console.error("[registerUser] Error:", err);
    return { success: false, message: "Registration failed." };
  }
};
