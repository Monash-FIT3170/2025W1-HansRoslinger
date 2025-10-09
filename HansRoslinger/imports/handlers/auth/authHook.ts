import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthCookie } from "../../cookies/cookies";
import { verifyJWT } from "./authToken";

export function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const { token, userId } = getAuthCookie();
    const valid =
      token != undefined && userId != undefined
        ? verifyJWT(token, userId)
        : false;
    if (!valid) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
}
