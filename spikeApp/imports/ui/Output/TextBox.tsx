import React from 'react';

export const TextBox: React.FC<{ value: string }> = ({ value }) => {
  return (
    <div>
      <textarea value={value} readOnly />
    </div>
  );
};