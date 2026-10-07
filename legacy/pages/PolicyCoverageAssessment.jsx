import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InfoField from '../components/InfoField';


function InfoField1({ label, value }) {
  return (
    <div className="flex flex-col grow shrink min-w-[240px] w-[326px] w-full">
      <label className="text-md leading-snug text-neutral-800">{label}</label>
      <div className="flex items-center p-1 mt-4 w-full bg-teal-50 rounded-lg shadow-[0px_0px_2px_rgba(0,0,0,1)]">
        <div className="flex gap-2 items-start self-stretch py-1 pr-1 pl-1 my-auto w-2">
          <div className="flex w-px rounded-lg bg-zinc-800 min-h-[22px]" />
        </div>
        <div className="flex-1 shrink self-stretch my-auto text-md font-medium leading-loose text-black basis-0">
          {value}
        </div>
      </div>
    </div>
  );
}

function PolicyCoverageAnalysis() {
  const [policyInfo, setPolicyInfo] = useState({}); // Changed to an object
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormDataObj] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  
  // Get formDataObj from location state
  const formDataObj = location.state || {};
  console.log("formData in policy coverage", formDataObj);
  const phoneNumber = sessionStorage.getItem('phoneNumber');
  const clearLocalStorage = () => {
    sessionStorage.clear();
  };

  useEffect(() => {
    const savedFormData = sessionStorage.getItem('formDataObj');
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setFormDataObj(parsedFormData);
    }
  }, []); // This runs only once on component mount
  
  useEffect(() => {
    // Store formDataObj in session storage only when it changes
    if (Object.keys(formDataObj).length > 0) {
      sessionStorage.setItem('formDataObj', JSON.stringify(formDataObj));
    }
  }, [formDataObj]); // This runs only when formDataObj changes
  
  useEffect(() => {
    if (!emailSent) {
      const sendEmail = async () => {
        const payload = {
          ...formDataObj,
          phoneNumber: phoneNumber
        };
    
        console.log("Payload being sent:", payload);
    
        setLoading(true);
        try {
          const response = await fetch('https://insurebuzz-backend.onrender.com/send-policy-email', {
            method: 'POST',
            body: JSON.stringify(payload),
            credentials: "include",
            headers: {
              'Content-Type': 'application/json',
            }
          });

          console.log("Response status:", response.status);
          console.log("Response headers:", response.headers);

          const responseText = await response.text();
          console.log("Raw response:", responseText);

          if (!response.ok) {
            console.error("Request failed with status:", response.status, "and message:", responseText);
          } else {
            const data = JSON.parse(responseText);
            console.log('Data received successfully:', data);
            setPolicyInfo(data);
            sessionStorage.clear();
          }
        } catch (error) {
          console.error('Error sending email:', error);
        } finally {
          setLoading(false);
        }
      };

      sendEmail();
    }
  }, [formDataObj, phoneNumber, emailSent]);

  const handleBackClick = () => {
    navigate(-1);
  };

  // Adding small logos in all four corners
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
          <header className="flex flex-wrap gap-5 justify-center items-center self-center max-w-full text-3xl font-bold text-center text-neutral-800 w-[572px]">
            <img src='/assets/img/ic_outline-policy.svg' className="w-16 h-16 mr-4" alt="Policy coverage assessment" />
            <h1 className="self-stretch my-auto">Policy coverage analysis</h1>
          </header>

          <main className="flex flex-wrap gap-2 items-start mt-20 max-md:mt-10 max-md:max-w-full">
  <div className="flex items-center mb-3 cursor-pointer mr-0 mt-0" onClick={handleBackClick}>
    <img src='/assets/img/left-arrow.svg' className="relative w-16 h-16" alt="logo" />
  </div>
  <div className="flex flex-col justify-center items-center px-3 py-7 rounded-xl bg-neutral-50 min-h-[660px] min-w-[240px] shadow-[0px_0px_4px_rgba(0,0,0,0.25)] w-[1042px] max-md:max-w-full">
    {loading ? (
      <div className="text-xl">Analysing your policy...</div>
    ) : (
      <div className="flex flex-wrap gap-8 items-start max-md:max-w-full">
  {/* Displaying specific fields from policyInfo */}
  <InfoField label="Policy Holder Name" value={policyInfo.name} />
  <InfoField label="Coverage Amount" value={policyInfo.coverage_amount} />
  <InfoField label="Start Date" value={policyInfo.start_date} />
  <InfoField label="End Date" value={policyInfo.end_date} />
  <InfoField label="Policy Inception Date" value={formDataObj.policyInceptionDate} />
  <InfoField label="Diagnosis Date" value={formDataObj.diagnosisDate} />
  <InfoField label="Ongoing Diseases" value={formDataObj.selectedOngoingDiseases.join(', ')} />
  <InfoField label="Smoke/Drink" value={formDataObj.smokeDrink.join(', ')} />
  <InfoField label="Add-Ons" value={policyInfo.add_ons.map(addOn => Object.keys(addOn)[0]).join(', ')} />
  <InfoField label="Pre-Hospitalization Coverage Days" value={policyInfo.pre_hospitalization_coverage_days} />
  <InfoField label="Post-Hospitalization Coverage Days" value={policyInfo.post_hospitalization_coverage_days} />
  <InfoField label="PED Waiting Period" value={policyInfo.ped_waiting_period} />
  <InfoField label="Waiting Period Exception Claims" value={policyInfo.waiting_period_exception_claims.join(', ')} />

  {/* Inclusions - Full width with bullet points */}
  <div className="w-full">
  <InfoField1 label="Inclusions" value={<ul className="list-disc list-inside pl-5">
      {Object.entries(policyInfo.inclusions).map(([key, value]) => (
        <li key={key}>{key}: {value}</li>
      ))}
    </ul>} />
  </div>

  {/* Exclusions - Full width with bullet points */}
  <div className="w-full">
  <InfoField1 label="Exclusions" value={<ul className="list-disc list-inside pl-5">
      {Object.entries(policyInfo.exclusions).map(([key, value]) => (
        <li key={key}>{key}: {value}</li>
      ))}
    </ul>} />
  </div>
</div>

    )}
  </div>
</main>
        </div>
      </div>
    </section>
  );
}

export default PolicyCoverageAnalysis;
