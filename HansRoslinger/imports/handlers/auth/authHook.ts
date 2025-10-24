import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthCookie } from "../../cookies/cookies";
import { verifyJWT } from "./authToken";

/**
 * useAuthGuard
 * -------------
 * Custom React hook to protect routes that require authentication.
 * - Checks for the presence of a JWT and userId in cookies.
 * - Verifies the JWT.
 * - Redirects to the home/login page if authentication fails.
 *
 * Usage: call this hook at the top of any component that should
 *        only be accessible by logged-in users.
 */
export function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve JWT and userId from cookies
    const { token, userId } = getAuthCookie();

    // Validate token presence and integrity
    const valid = token !== undefined && userId !== undefined 
      ? verifyJWT(token, userId) 
      : false;

    // If token is invalid or missing, redirect to home/login page
    if (!valid) {
      navigate("/", { replace: true });
    }
  }, [navigate]); // Dependency ensures navigation is always up-to-date
}
