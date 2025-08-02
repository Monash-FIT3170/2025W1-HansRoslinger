import React from "react";

interface ToolbarProps {
  title: string;
  actions: React.ReactNode;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ title, actions, className }) => (
  <div className={`w-full bg-cyan-500 p-4 flex items-center shadow relative ${className || ""}`}>
    <h2 className="text-white text-2xl font-bold flex-1">{title}</h2>
    <div className="flex space-x-4">{actions}</div>
  </div>
);

export default Toolbar;
