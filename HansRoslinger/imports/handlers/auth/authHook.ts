import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthCookie } from "./authCookie";
import { verifyJWT } from "./authToken";

export function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const { token, userId } = getAuthCookie();
    const valid = verifyJWT(token, userId);
    if (!valid){
        navigate("/", {replace: true})
    }
  }, [navigate]);
}