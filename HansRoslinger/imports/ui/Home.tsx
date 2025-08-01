import React from "react";
import { useAuthGuard } from "../handlers/auth/authHook";
export const Home: React.FC = () => {
  useAuthGuard()
  
  return (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-3xl font-bold mb-4">Home</h1>
    {/* Add your home content here */}
  </div>
);
}