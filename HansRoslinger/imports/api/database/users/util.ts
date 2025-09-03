import bcrypt from "bcrypt";

export type ValidationResult = { valid: boolean; message?: string };

// Password validation constants
// At least 12 characters
const PASSWORD_MIN_LENGTH = 12;
// Contains an uppercase
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
// Contains a number
const PASSWORD_NUMBER_REGEX = /[0-9]/;
// Contains a special characters
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export async function validateEmail(email: string): Promise<ValidationResult> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format." };
  }

  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }
  if (!PASSWORD_NUMBER_REGEX.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number.",
    };
  }
  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character.",
    };
  }
  return { valid: true };
}

export async function hashPassword(password: string): string {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function verifyPassword(password, hash) {
  const match = await bcrypt.compare(password, hash);
  return match; 
};
