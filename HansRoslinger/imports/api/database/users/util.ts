import bcrypt from "bcryptjs";

export type ValidationResult = { valid: boolean; message?: string };

// Password validation rules
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

// Validates email format using a simple regex pattern
export async function validateEmail(email: string): Promise<ValidationResult> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format." };
  }

  return { valid: true };
}

// Checks a password against several strength criteria
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

// Hashes a password using bcrypt with a fixed number of salt rounds
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

// Verifies whether a plaintext password matches a stored bcrypt hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const match = await bcrypt.compare(password, hash);
  return match;
}
