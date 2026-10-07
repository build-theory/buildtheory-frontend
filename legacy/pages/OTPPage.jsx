import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle'; 
import OTPInput from '../components/OTPInput';
import ResendTimer from '../components/ResendTimer';
import LoginButton from '../components/LoginButton';
import GoogleLoginButton from '../components/GoogleLoginButton';
import Divider from '../components/Divider'; 
import TermsAndPrivacy from '../components/TermsAndPrivacy'; 

function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResendAllowed, setIsResendAllowed] = useState(false);
  const [timer, setTimer] = useState(30); 

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        clearInterval(countdown);
        setIsResendAllowed(true);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleInputChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(30);
    setIsResendAllowed(false);
    // Implement OTP resend logic here
  };

  const navigate = useNavigate();
  const handleCardClick = (value) => {
    navigate('/' + value);
  }
  

  const handleSubmit = () => {
    const completeOtp = otp.join('');
    console.log("OTP Submitted: ", completeOtp);
    // Handle OTP submission logic here
  };

  return (
    <main className="overflow-hidden py-8 pr-8 pl-16 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5">
      <div className="flex gap-5 max-md:flex-col">
        <section className="flex flex-col w-[45%] max-md:ml-0 max-md:w-full">
          <img 
            loading="lazy" 
            src="assets/img/login.svg" 
            alt="OTP illustration" 
            className="object-contain self-stretch my-auto w-full aspect-[0.91] max-md:mt-10 max-md:max-w-full" 
          />
        </section>
        <section className="flex flex-col ml-5 w-[55%] max-md:ml-0 max-md:w-full rounded-2xl bg-gradient-main" >
          <div className="flex flex-col grow justify-center items-center py-7 w-full rounded-3xl bg-[linear-gradient(104deg,#C2FEFE_0.01%,rgba(255,228,199,0.20_99.99%))] max-md:mt-10 max-md:max-w-full">
            <div className="flex flex-col justify-center items-center max-w-full w-[446px]">
              <h1 className="flex-1 shrink self-stretch my-auto text-3xl font-semibold leading-none basis-3 text-neutral-800">
                OTP Verification
              </h1>
              <div className="mt-2 text-center text-gray-600">
                OTP sent to your mobile number.
              </div>
            </div>
            <div className="flex flex-col mt-11 max-w-full w-[444px] max-md:mt-10">
              <div className="flex space-x-2 justify-center items-center w-full whitespace-nowrap max-md:max-w-full">
                <OTPInput index={0} value={otp[0]} onChange={handleInputChange} />
                <OTPInput index={1} value={otp[1]} onChange={handleInputChange} />
                <OTPInput index={2} value={otp[2]} onChange={handleInputChange} />
                <OTPInput index={3} value={otp[3]} onChange={handleInputChange} />
              </div>
              <ResendTimer isResendAllowed={isResendAllowed} timer={timer} onResend={handleResendOtp} />
              <button className="gap-2.5 self-stretch px-10 py-2 mt-6 w-full text-xl font-medium leading-10 whitespace-nowrap bg-gray-900 rounded-3xl min-h-[60px] text-zinc-50 max-md:px-5 max-md:max-w-full"
                onClick={() => {
                  handleCardClick('home-screen');
                  handleSubmit();  
                }}>
                Login
              </button>

              <Divider />
              <GoogleLoginButton />
              <TermsAndPrivacy />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OTPPage;
