import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ClaimEmail() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state || {};
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleBackClick = () => {
    navigate(-1);
  };

  const clearLocalStorage = () => {
    sessionStorage.removeItem('inputField1'); // Clear policyInceptionDate
    sessionStorage.removeItem('inputField2'); // Clear diagnosisDate
    // Clear other fields as needed...
    };
  useEffect(() => {
        const storedPhoneNumber = sessionStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      }, []);


  const handleCardClick = async () => {
    setSubmitted(true);
    setLoading(true);

    const combinedData = {
        ...formData,
        email: email,
      };

      console.log("form data in claim email: ", combinedData);
  
      const payload = {
        ...combinedData,
        phoneNumber: phoneNumber
      };

      console.log("form data in claim email payload: ", payload);
  
      try {
        
        const response = await fetch('https://insurebuzz-backend.onrender.com/send-email', {
                method: 'POST',
                body: JSON.stringify(payload),
                credentials: "include",
                headers: {
                  'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Email sent successfully:', data);
                clearLocalStorage();
              } else {
                console.error('Email sending failed:', response.statusText);
              }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    };

  const logoUrl = '/assets/img/innerLogo.svg';

  return (
    <section className="relative flex flex-col bg-teal-50 bg-gradient-main h-full">
      {/* Logos */}
      <img src={logoUrl} className="absolute top-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute top-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />

      <div className="flex flex-col items-center px-20 pt-14 pb-40 w-full rounded-3xl max-md:px-5 max-md:pb-24 max-md:max-w-full">
        
        <div className="flex flex-col -mb-8 w-full max-w-[1202px] max-md:mb-2.5 max-md:max-w-full">

          <div className="flex flex-col justify-center items-center">
            {!submitted ? (
              <>
                <div className='flex'>
                    <img src='/assets/img/email.svg' className="w-12 h-12 mx-4 my-8" alt="Insurebuzz AI Logo" />
                    <h2 className="text-center text-4xl font-semibold my-8 text-neutral-800">Mail Address</h2>
                </div>
                <section className="relative flex  items-start mt-10 max-md:flex-col">
                    <div className="flex items-center mb-3 cursor-pointer" onClick={handleBackClick}>
                        <img src='/assets/img/left-arrow.svg' className="w-16 h-16" alt="Back" />
                    </div>
                  <div className="flex flex-col justify-center items-center px-10 py-8 rounded-xl shadow-lg w-[400px] h-[450px] bg-[#FDFCFB]">
                    <img src='/assets/img/email-vector.svg' alt="Card logo" className="w-40 h-40 mb-4" />
                    <h3 className="text-md font text-center mb-2">
                      Provide your Email ID so that you can receive your customized claim settlement or policy assessment report
                    </h3>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border rounded p-2 mt-2 w-full"
                    />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your Phone Number"
                      className="border rounded p-2 mt-2 w-full"
                    />
                    <button 
                      onClick={handleCardClick}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <>
                <div className='flex'>
                <img src='/assets/img/email.svg' className="w-12 h-12 mx-4 my-8" alt="Insurebuzz AI Logo" />
                <h2 className="text-center text-4xl font-semibold my-8 text-neutral-800">Mail Address</h2>
                </div>
                <section className="relative flex items-start mt-10 max-md:flex-col">
                <div className="flex items-center mb-3 cursor-pointer" onClick={handleBackClick}>
                    <img src='/assets/img/left-arrow.svg' className="w-16 h-16" alt="Back" />
                </div>
                  <div className="flex flex-col justify-center items-center px-10 py-8 rounded-xl shadow-lg w-[400px] h-[450px] bg-[#FDFCFB]">
                    <img src='/assets/img/green-tick.svg' alt="Card logo" className="w-40 h-40 mb-4" />

                    <h3 className="text-lg font-semibold text-center mb-2">
                        Thankyou for providing you details
                    </h3>
                    <h3 className="text-md font text-center mb-2">
                        Within next 15 minutes, you will receive your customized claim settlement or policy assessment report on your provided mail ID
                    </h3>
                    <button 
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Alright
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClaimEmail;
