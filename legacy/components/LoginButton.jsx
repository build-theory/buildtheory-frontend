import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginButton() {

  const navigate = useNavigate();
  const handleCardClick = (value) => {
    navigate('/' + value);
  }

  return (
    <button className="gap-2.5 self-stretch px-10 py-2 mt-6 w-full text-xl font-medium leading-10 whitespace-nowrap bg-blue-700 rounded-3xl min-h-[60px] text-zinc-50 max-md:px-5 max-md:max-w-full"
    onClick={() => handleCardClick('otp')}>
      Login
    </button>
  );
}

export default LoginButton;