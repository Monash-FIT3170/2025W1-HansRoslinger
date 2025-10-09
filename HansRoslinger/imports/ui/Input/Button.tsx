import React from "react";

// Button component that takes 'label', 'onClick', and optional 'className' as props
export const Button: React.FC<{
  label: string;
  onClick: () => void;
  className?: string;
}> = ({ label, onClick, className = "" }) => {
  const defaultClasses = "px-4 py-2 bg-gray-500 text-white rounded hover:bg-blue-600 transition";

  return (
    <button
      onClick={onClick}
      className={`${defaultClasses} ${className}`} // Append additional classes
    >
      {label}
    </button>
  );
};
