import { Cookies } from "meteor/ostrio:cookies"; // Import Cookies package for managing cookies

const timeout = 1000 * 60 * 60; // Cookie expiration time in milliseconds (1 hour)

// Placeholder function for encrypting data
export async function encrypt(payload: any) {
  return payload; // Currently returns the payload as-is
}

// Placeholder function for decrypting data
export async function decrypt(payload: any) {
  return payload; // Currently returns the payload as-is
}

// Set a cookie with the given name and data
export async function setCookie(name: string, data: any) {
  const expires = new Date(Date.now() + timeout); // Calculate expiration date
  const info = await encrypt({ data, expires }); // Encrypt the data along with expiration
  Cookies().set(name, info, { expires, httpOnly: true }); // Store the cookie with httpOnly flag
}

// Get a cookie by name and decrypt its contents
export async function getCookie(name: string) {
  const info = Cookies().get(name)?.value; // Retrieve the cookie value
  if (!info) {
    return null; // Return null if cookie does not exist
  }
  const data = await decrypt(info); // Decrypt the cookie value
  return data; // Return the decrypted data
}
