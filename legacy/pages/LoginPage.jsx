import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle';
import Divider from '../components/Divider';
import GoogleLoginButton from '../components/GoogleLoginButton';
import TermsAndPrivacy from '../components/TermsAndPrivacy';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Integrated InputField component
const InputField = ({ label, placeholder, prefix, value, onChange }) => {
  return (
    <div className="flex flex-col mt-6 w-full max-w-[444px] max-md:max-w-full">
      <label className="text-2xl font-medium leading-none text-neutral-800 max-md:max-w-full">
        {label}
      </label>
      <div className="flex items-center p-3 mt-4 w-full rounded-lg bg-zinc-50 min-h-[54px] shadow-[0px_0px_2px_rgba(0,0,0,1)] max-md:max-w-full">
        {prefix && (
          <span className="self-stretch my-auto text-lg leading-loose text-stone-500 text-opacity-70 w-[33px]">
            {prefix}
          </span>
        )}
        <div className="flex gap-2.5 items-start self-stretch py-1 pr-1 pl-1 my-auto w-2">
          <div className="flex w-px rounded-lg bg-zinc-800 min-h-[22px]" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 shrink self-stretch my-auto text-lg leading-loose basis-0 text-stone-500 text-opacity-70 bg-transparent border-none outline-none"
          aria-label={label}
        />
      </div>
    </div>
  );
};

// Custom login button component
const LoginButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="gap-2.5 self-stretch px-10 py-2 mt-6 mx-0 w-full text-xl font-medium leading-10 whitespace-nowrap bg-gray-900 rounded-3xl min-h-[60px] text-zinc-50 max-md:px-5 max-md:max-w-full"
    type="button"
  >
    Enter
  </button>
);

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedPhoneNumber = sessionStorage.getItem('phoneNumber') || '';
    setPhoneNumber(savedPhoneNumber);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault(); // This line is not necessary anymore as we're using onClick

    // Basic validation
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    sessionStorage.setItem('phoneNumber', phoneNumber);
    console.log('Logging in with:', { name, phoneNumber });
    // Add your login logic here
    navigate('/home-screen');
  };

  return (
    <main className="overflow-hidden py-8 pr-8 pl-16 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5 h-100vh">
      <ToastContainer />
      <div className="flex gap-5 max-md:flex-col">
        <section className="flex flex-col w-[45%] max-md:ml-0 max-md:h-full">
          <img 
            loading="lazy" 
            src="assets/img/login.svg" 
            alt="Login illustration" 
            className="object-contain self-stretch my-auto w-full aspect-[0.91] max-md:mt-10 max-md:max-w-full" 
          />
        </section>
        <section className="flex flex-col ml-5 w-[55%] max-md:ml-0 max-md:w-full rounded-2xl bg-gradient-main"
          >
          <div className="flex flex-col grow justify-center items-center py-7 w-full rounded-3xl bg-[linear-gradient(104deg,#C2FEFE_0.01%,rgba(255,228,199,0.20_99.99%))] max-md:mt-10 max-md:max-w-full">
            <div className="flex flex-col justify-center items-center max-w-full w-[446px]">
              <img 
                loading="lazy" 
                src="" 
                alt="Login logo" 
                className="object-contain max-w-full aspect-square w-[248px]" 
              />
            </div>
            <div className="flex flex-col mt-11 max-w-full w-[444px] max-md:mt-10">
              <div className="flex justify-center items-center w-full whitespace-nowrap max-md:max-w-full">
                <h1 className="flex-1 shrink self-stretch my-auto text-3xl font-semibold leading-none text-neutral-800">
                  Login
                </h1>
                <LanguageToggle />
              </div>
              <div className="flex flex-col mt-6 w-full max-w-[444px] max-md:max-w-full">
                <InputField 
                  label="Name" 
                  placeholder="Enter your name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <InputField 
                  label="Phone Number" 
                  placeholder="Enter your phone number" 
                  prefix="+91" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <LoginButton onClick={handleLogin} />
              </div>
              <TermsAndPrivacy />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;