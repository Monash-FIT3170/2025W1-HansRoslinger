import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
  ariaLabel?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, widthClass = "w-96", ariaLabel = "Close" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className={`bg-white rounded-lg shadow-lg p-8 relative ${widthClass}`}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label={ariaLabel}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
