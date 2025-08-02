import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export function generateJWT(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyJWT(token: string, userId: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId === userId;
  } catch {
    return false;
  }
}
