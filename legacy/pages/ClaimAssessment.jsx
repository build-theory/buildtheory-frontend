import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoField from '../components/InfoField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronDownIcon } from '@heroicons/react/outline'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function DateInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col grow shrink ">
      <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="text-md">
        {label}
      </label>
      <div className="flex items-center px-2 w-full mt-2 border rounded bg-[#FDFCFB]">
        <div className="flex gap-2.5 items-start self-stretch py-1 pr-1 pl-1 my-auto w-2">
          <div className="flex w-px rounded-lg bg-zinc-800 min-h-[22px]" />
        </div>
        <input
          type="date"
          id={label.replace(/\s+/g, '-').toLowerCase()}
          className="flex-1 shrink self-stretch my-auto text-lg leading-loose basis-0 text-stone-500 text-opacity-70 bg-transparent"
          placeholder="DD/MM/YYYY"
          value={value || ''}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function ClaimAssessment() {
  const navigate = useNavigate();

  const [policyInceptionDate, setPolicyInceptionDate] = useState(null);
  const [diagnosisDate, setDiagnosisDate] = useState(null);
  const [ongoingDiseases, setOngoingDiseases] = useState({
    Thyroid: false,
    Diabetes: false,
    Kidney: false,
    Critical_Disease: false,
    Other: false,
  });
  const [files, setFiles] = useState({});
  const [specificDisease, setSpecificDisease] = useState('');
  const [smokeDrink, setSmokeDrink] = useState('');
  const [isDiseaseDropdownOpen, setIsDiseaseDropdownOpen] = useState(false); 
  const [isSmokeDrinkDropdownOpen, setIsSmokeDrinkDropdownOpen] = useState(false); 
  const [uploadedFilePaths, setUploadedFilePaths] = useState({});
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const totalFiles = 6;   


  useEffect(() => {
    const savedInputField1 = sessionStorage.getItem('inputField1') || '';
    const savedInputField2 = sessionStorage.getItem('inputField2') || '';
    const savedFile1 = sessionStorage.getItem('fileInput1') || '';
    const savedInputField3 = sessionStorage.getItem('phoneNumber') || '';

    setPolicyInceptionDate(savedInputField1); // Assuming this is the correct mapping
    setDiagnosisDate(savedInputField2);
    setPhoneNumber(savedInputField3);

    // Restore uploaded file paths
    const savedUploadedFiles = {}; // Map your localStorage keys for each file
    // Example: savedUploadedFiles['Policy Document'] = localStorage.getItem('policyDocument') || '';
    setUploadedFilePaths(savedUploadedFiles);
  }, []);


  const saveInputValues = () => {
    sessionStorage.setItem('inputField1', policyInceptionDate); // Save the date value
    sessionStorage.setItem('inputField2', diagnosisDate); // Save the date value
    // Save other fields as needed...
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const logoUrl = '/assets/img/innerLogo.svg';

  const handleDiseaseChange = (disease) => {
    setOngoingDiseases((prevState) => ({
      ...prevState,
      [disease]: !prevState[disease],
    }));
    // If "Other" is unchecked, clear the specific disease input
    if (disease !== 'Other') {
      setOngoingDiseases((prevState) => ({
        ...prevState,
        Other: false,
      }));
    } else if (!ongoingDiseases.Other) {
      setSpecificDisease('');
    }
  };

  const handleFileUploadClick = (fileType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*'; 

    input.onchange = async (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            const file = selectedFiles[0];
            const filePath = file.name;

            setUploadedFilePaths((prev) => ({ ...prev, [fileType]: filePath }));

            

            setUploadedFilesCount((prevCount) => prevCount + 1);

            // console.log(uploadedFilePaths);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileType', fileType);
            formData.append('phoneNumber', phoneNumber);

            // console.log("form data in jsx: ", formData);
            const toastId = toast.loading(`Uploading ${fileType}...`);

            try {
                const response = await fetch('https://insurebuzz-backend.onrender.com/upload', {
                    method: 'POST',
                    body: formData,
                    credentials: "include",
                    headers: {
                      'Accept': 'application/json'
                    }
                      
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (response.ok) {
                    const data = await response.json();
                    console.log('File uploaded successfully:', data);
                    toast.update(toastId, {
                      render: `${fileType} uploaded successfully!`,
                      type: 'success',
                      isLoading: false,
                      autoClose: 1500,
                    });
                } else {
                    console.error('File upload failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                toast.update(toastId, {
                  render: `Error in ${fileType} uploading, Please try again later`,
                  type: 'error',
                  isLoading: false,
                  autoClose: 2000,
                });
            }
        }
         else {
            toast.error('No file selected.');
        }
    };

    input.click();
};

const handleSubmit = async () => {
    saveInputValues();
    const formDataObj = {
        policyInceptionDate,
        diagnosisDate,
        ongoingDiseases,
        specificDisease,
        smokeDrink,
        uploadedFilePaths,
        type: "claim"
    };

    // Navigate to 'claim-email' route, passing formDataObj via state
    navigate('/claim-email', { state: formDataObj });
};



  return (
    <section className="relative flex flex-col bg-teal-50 bg-gradient-main h-full w-full">
      <img src={logoUrl} className="absolute top-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute top-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />

      <div className="flex flex-col items-start justify-between px-20 pt-14 pb-40 w-full rounded-3xl max-md:px-5 max-md:pb-24 max-md:max-w-full">
        

        <div className="flex items-center m-auto mb-8">
          <img src='/assets/img/claim-assessment.svg' className="w-16 h-16 mr-4" alt="Claim Assessment" />
          <h2 className="text-4xl font-semibold text-neutral-800">Claim Assessment</h2>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start w-full mb-10">
          <div className="flex items-center mb-3 cursor-pointer -mt-1" onClick={handleBackClick}>
            <img src='/assets/img/left-arrow.svg' className="relative w-16 h-16" alt="Back" />
          </div>
          
          <div className="flex flex-col w-full md:w-1/4 mx-auto md:mx-4 mb-4">
            <DateInput label="Policy inception date" value={policyInceptionDate} onChange={(e) => setPolicyInceptionDate(e.target.value)} />
          </div>

          <div className="flex flex-col w-full md:w-1/4 mx-auto md:mx-4 mb-4">
            <label className="mb-2">Ongoing Disease/Treatment</label>
            <div className="relative">
              <button
                onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}
                className="flex justify-between items-center border rounded p-2 w-full bg-white mt-0 ml-0 mb-2"
              >
                <span className='text-gray-400'>
                  {Object.keys(ongoingDiseases).filter(disease => ongoingDiseases[disease]).join(', ') || 'Select any disease'}
                </span>
                <ChevronDownIcon className="w-5 h-5 ml-2" />
              </button>
              {isDiseaseDropdownOpen && (
                <div className="absolute z-10 bg-[#FDFCFB] border rounded p-4 w-full mt-1 shadow-lg">
                  {Object.keys(ongoingDiseases).map((disease) => (
                    <div key={disease} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={ongoingDiseases[disease]}
                        onChange={() => handleDiseaseChange(disease)}
                        className="mr-2"
                      />
                      <label>{disease.replace('_',' ')}</label>
                    </div>
                  ))}
                  {ongoingDiseases.Critical_Disease && (
                    <input
                      type="text"
                      value={specificDisease}
                      onChange={(e) => setSpecificDisease(e.target.value)}
                      placeholder="Specify critical disease"
                      className="border rounded p-2 mt-2 w-full"
                    />
                  )}
                  {ongoingDiseases.Other && (
                    <input
                      type="text"
                      value={specificDisease}
                      onChange={(e) => setSpecificDisease(e.target.value)}
                      placeholder="Specify other disease"
                      className="border rounded p-2 mt-2 w-full"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

  <div className="flex flex-col w-full md:w-1/4 mx-auto md:mx-4 mb-4">
    <DateInput label="Diagnosis date" value={diagnosisDate} onChange={(e) => setDiagnosisDate(e.target.value)} />
  </div>

  <div className="flex flex-col w-full md:w-1/4 mx-auto md:mx-4 mb-4">
    <label className="mb-2">Smoke/Drink?</label>
    <div className="relative">
      <button
        onClick={() => setIsSmokeDrinkDropdownOpen(!isSmokeDrinkDropdownOpen)}
        className="flex justify-between items-center border rounded p-2 w-full bg-white mt-0 ml-0 mb-2"
      >
        <span className='text-gray-400'>{smokeDrink || 'Select'}</span>
        <ChevronDownIcon className="w-5 h-5 ml-2" />
      </button>
      {isSmokeDrinkDropdownOpen && (
        <div className="absolute z-10 bg-[#FDFCFB] border rounded p-4 w-full mt-1 shadow-lg">
          <div className="flex items-center mb-2 cursor-pointer" onClick={() => setSmokeDrink('Yes')}>
            <input
              type="radio"
              checked={smokeDrink === 'Yes'}
              onChange={() => setSmokeDrink('Yes')}
              className="mr-2"
            />
            <label>Yes</label>
          </div>
          <div className="flex items-center mb-2 cursor-pointer" onClick={() => setSmokeDrink('No')}>
            <input
              type="radio"
              checked={smokeDrink === 'No'}
              onChange={() => setSmokeDrink('No')}
              className="mr-2"
            />
            <label>No</label>
          </div>
        </div>
      )}
    </div>
  </div>
</div>


        <h3 className="text-2xl text-center m-auto font-semibold text-center">
        Upload Your Files
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center m-auto mt-10">
        {['Policy Document', 'Discharge Summary', 'Bills', 'Prescriptions', 'Reports', 'Claim Form'].map((fileType, idx) => (
            <div 
                key={idx} 
                className="relative flex flex-col justify-center items-center px-6 py-4 rounded-lg shadow-md w-[160px] h-[214px] bg-[#F2FFFF] cursor-pointer"
                onClick={() => handleFileUploadClick(fileType)}
            >
                {uploadedFilePaths[fileType] && <img src="/assets/img/green-tick.svg" alt="Uploaded" className="absolute top-2 left-2 w-8 h-8" />} {/* Tick icon */}
                <img src={`/assets/img/file-upload-${idx + 1}.svg`} alt={`${fileType} logo`} className="w-16 h-16 mb-4" />
                <h4 className="text-md font-semibold text-center">{fileType}</h4>
            </div>
        ))}

        </div>

        <button
            className={`m-auto mt-10 px-6 py-2 rounded-full transition duration-300 ${uploadedFilesCount >= totalFiles ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-gray-400 text-gray-300 cursor-not-allowed'}`}
            onClick={uploadedFilesCount >= totalFiles ? handleSubmit : () => toast.error('Please upload all files before submitting.')}
            disabled={uploadedFilesCount < totalFiles} // Disable button if less than required files are uploaded
        >
            Submit
        </button>


      </div>
      <ToastContainer />
    </section>
  );
}

export default ClaimAssessment;
