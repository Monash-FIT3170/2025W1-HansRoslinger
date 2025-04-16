// Input/InputField.tsx
import React from 'react';

export const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => {
    return (
        <div>
            <label>{label}</label>
            <br />
            <input type='text' value={value} onChange={onChange} />
        </div>
    );
};