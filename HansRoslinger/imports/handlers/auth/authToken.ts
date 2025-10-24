import jwt from "jsonwebtoken";

// Secret key for signing JWTs. In production, set via environment variables.
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/**
 * generateJWT
 * ------------
 * Generates a JSON Web Token for a given user ID.
 * - Payload contains only the userId.
 * - Token expires in 1 day.
 *
 * @param userId - the unique identifier of the user
 * @returns signed JWT string
 */
export function generateJWT(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
}

/**
 * verifyJWT
 * ----------
 * Verifies that a JWT is valid and matches the expected userId.
 * - Returns true if token is valid and belongs to the user.
 * - Returns false if token is missing, invalid, or expired.
 *
 * @param token - JWT to verify
 * @param userId - expected userId
 * @returns boolean indicating validity
 */
export function verifyJWT(token: string, userId: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId === userId;
  } catch {
    // Token invalid, expired, or verification failed
    return false;
  }
}
