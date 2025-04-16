// Input/Button.tsx
import React from 'react';

// Button component that takes 'label' and 'onClick' as props
export const Button: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
    return (
        <button onClick={onClick}>{label}</button>
    );
};