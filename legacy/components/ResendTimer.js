import React from 'react';

function ResendTimer({ isResendAllowed, timer, onResend }) {
  return (
    <div className="mt-4">
      {isResendAllowed ? (
        <button onClick={onResend} className="text-blue-500">
          Resend OTP
        </button>
      ) : (
        <p className="text-gray-600">
          Resend OTP in {timer} seconds
        </p>
      )}
    </div>
  );
}

export default ResendTimer;
