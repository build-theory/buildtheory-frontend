import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoField from '../components/InfoField';

function HomeScreen() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCardClick = (value) => {
    navigate('/' + value);
  }

  const logoUrl = '/assets/img/innerLogo.svg';

  return (
    <section className="relative flex flex-col bg-teal-50 bg-gradient-main h-full">
      {/* Small logos in all four corners */}
      <img src={logoUrl} className="absolute top-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute top-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />

      <div className="flex flex-col items-center px-20 pt-14 pb-40 w-full rounded-3xl max-md:px-5 max-md:pb-24 max-md:max-w-full">
        <div className="flex flex-col -mb-8 w-full max-w-[1202px] max-md:mb-2.5 max-md:max-w-full">

          {/* Back arrow */}
          {/* <div className="flex items-center mb-3 cursor-pointer" onClick={handleBackClick}>
            <img src='/assets/img/left-arrow.svg' className="relative w-16 h-16" alt="Back" />
          </div> */}

            
          <div className="flex flex-col justify-center items-center">
            <img src='/assets/img/logo.svg' className="w-32 h-32" alt="Insurebuzz AI Logo" />
            <h2 className="text-center text-4xl font-semibold my-8 text-neutral-800">Insurebuzz AI</h2>
            </div>


          <section className="flex flex-wrap gap-10 justify-center items-center mt-14 max-md:flex-col">
            <div className="flex flex-col justify-center items-center px-10 py-8 rounded-xl shadow-lg w-[320px] h-[388px] bg-gray-50"
                onClick={() => {handleCardClick('policy-coverage')}}>
              <img src='/assets/img/ic_outline-policy.svg' alt="Card logo" className="w-28 h-28 mb-4" />
              <h3 className="text-2xl font-semibold text-center">Policy Coverage Assessment</h3>
            </div>

            <div className="flex flex-col justify-center items-center px-10 py-8 rounded-xl shadow-lg w-[320px] h-[388px] bg-gray-50"
                onClick={() => {handleCardClick('claim-assessment')}}>
              <img src='/assets/img/claim-assessment.svg' alt="Card logo" className="w-28 h-28 mb-4" />
              <h3 className="text-2xl font-semibold text-center">Claim Assessment</h3>
            </div>
          </section>

        </div>
      </div>
    </section>
  );
}

export default HomeScreen;
