import React from 'react';

export function InputField({ label, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <br></br>
      <input type='text' value={value} onChange={onChange} />
    </div>
  );
}
