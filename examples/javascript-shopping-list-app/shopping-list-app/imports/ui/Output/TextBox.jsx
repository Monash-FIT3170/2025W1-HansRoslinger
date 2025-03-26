import React from 'react';

export function TextBox({ value }) {
  return (
    <div>
      <textarea value={value} readOnly />
    </div>
  );
}
