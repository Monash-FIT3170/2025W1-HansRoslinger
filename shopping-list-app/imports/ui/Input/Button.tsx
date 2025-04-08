// Input/Button.tsx
import React from 'react';

// Button component that takes 'label' and 'onClick' as props
export function Button({ label, onClick }) {
    return (
        <button onClick={onClick}>{label}</button>
    );
}