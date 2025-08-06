import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../handlers/auth/authHandlers";
import { setAuthCookie } from "../cookies/cookies";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await loginUser(username, password);

      setMessage(result.message ?? null);
      
      if (result.success && result.token && result.userId) {
        setAuthCookie(result.token, result.userId);
        navigate("/home");
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        setMessage((error as { message?: string }).message || "An error occurred during login.");
      } else {
        setMessage("An error occurred during login.");
      }
    }
  };

  const handleRegister = async () => {
    try {
      const result = await registerUser(username, password);
      
      setMessage(result.message ?? null);
      
      if (result.success && result.token && result.userId) {
        setAuthCookie(result.token, result.userId);
        navigate("/home");
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        setMessage((error as { message?: string }).message || "An error occurred during registration.");
      } else {
        setMessage("An error occurred during registration.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <input
        className="border p-2 mb-2"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 mb-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex space-x-2">
        <button
          className="bg-cyan-400 text-black px-4 py-2 rounded transition-colors duration-150 hover:bg-cyan-500 active:bg-cyan-600"
          onClick={handleLogin}
        >
          Login
        </button>
        <button
          className="bg-cyan-400 text-black px-4 py-2 rounded transition-colors duration-150 hover:bg-cyan-500 active:bg-cyan-600"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
      <div className="mt-4 text-center min-h-[1.5em]">
        {message && <span className="text-red-500">{message}</span>}
      </div>
    </div>
  );
};
