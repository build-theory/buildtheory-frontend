import React from 'react';

function OTPInput({ index, value, onChange }) {
  return (
    <input
      id={`otp-input-${index}`}
      type="text"
      maxLength="1"
      className="w-12 h-12 text-center border rounded"
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
    />
  );
}

export default OTPInput;
