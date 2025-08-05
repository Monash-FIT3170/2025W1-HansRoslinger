import React from "react";
import { useAuthGuard } from "../handlers/auth/authHook";
import { useNavigate } from "react-router-dom";
import { clearAuthCookie } from "../cookies/cookies";

export const Home: React.FC = () => {
  useAuthGuard();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthCookie();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Home</h1>
      <div className="flex flex-col space-y-6 w-64">
        <button
          className="bg-cyan-500 text-white text-xl py-6 rounded-lg shadow-lg hover:bg-cyan-600 transition-colors"
          onClick={() => navigate("/allpresentations")}
        >
          Presentations
        </button>
        <button
          className="bg-cyan-500 text-white text-xl py-6 rounded-lg shadow-lg hover:bg-cyan-600 transition-colors"
          onClick={() => console.log("Settings not added yet")}
        >
          Settings
        </button>
        <button
          className="bg-red-500 text-white text-xl py-6 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};