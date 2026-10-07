import { React, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DateInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col grow shrink min-w-[240px] w-[326px]">
      <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="text-xl font-medium leading-snug text-neutral-800">
        {label}
      </label>
      <div className="flex items-center p-3 mt-4 w-full rounded-lg bg-zinc-50 max-w-[408px] shadow-[0px_0px_2px_rgba(0,0,0,1)]">
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

function CheckboxGroup({ label, options, selectedOptions, onChange }) {
  return (
    <div className="flex flex-col grow shrink min-w-[240px] text-neutral-800 w-[326px]">
      <fieldset>
        <legend className="text-xl font-medium leading-snug">{label}</legend>
        <div className="flex flex-col p-2.5 mt-4 w-full text-lg leading-loose rounded-lg bg-zinc-50 max-w-[408px] shadow-[0px_0px_2px_rgba(0,0,0,1)]">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 items-center mt-2.5 first:mt-0 w-full whitespace-nowrap">
              <input
                type="checkbox"
                id={`${option.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                name={option.toLowerCase().replace(/\s+/g, '-')}
                className="flex shrink-0 self-stretch my-auto w-7 h-7 rounded border border-blue-700 border-solid bg-zinc-50"
                checked={selectedOptions.includes(option)}
                onChange={() => onChange(option)}
              />
              <label htmlFor={`${option.toLowerCase().replace(/\s+/g, '-')}-${index}`} className="self-stretch my-auto">
                {option}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function PolicyCoverage() {
  const ongoingDiseases = ['Thyroid', 'Diabetes', 'Kidney disease', 'Critical disease', 'Other', 'None'];
  const smokingDrinkingOptions = ['Smoke', 'Drink', 'None'];
  const logoUrl = '/assets/img/innerLogo.svg';

  const navigate = useNavigate();

  // States for input fields
  const [policyInceptionDate, setPolicyInceptionDate] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [selectedOngoingDiseases, setSelectedOngoingDiseases] = useState([]);
  const [smokeDrink, setSmokeDrink] = useState([]);
  const [uploadedFilePaths, setUploadedFilePaths] = useState({});
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const totalFiles = 1;

  // Load input values from session storage when the component mounts
  useEffect(() => {
    const savedPolicyInceptionDate = sessionStorage.getItem('policyInceptionDate');
    const savedDiagnosisDate = sessionStorage.getItem('diagnosisDate');
    const savedOngoingDiseases = JSON.parse(sessionStorage.getItem('selectedOngoingDiseases')) || [];
    const savedSmokeDrink = JSON.parse(sessionStorage.getItem('smokeDrink')) || [];
    const savedFilePaths = JSON.parse(sessionStorage.getItem('uploadedFilePaths')) || {};
    const savedInputField3 = sessionStorage.getItem('phoneNumber') || '';

    setPolicyInceptionDate(savedPolicyInceptionDate || '');
    setDiagnosisDate(savedDiagnosisDate || '');
    setSelectedOngoingDiseases(savedOngoingDiseases);
    setSmokeDrink(savedSmokeDrink);
    setUploadedFilePaths(savedFilePaths);
    setUploadedFilesCount(Object.keys(savedFilePaths).length);
    setPhoneNumber(savedInputField3);
  }, []);

  // Save input values to session storage
  const saveInputValues = () => {
    sessionStorage.setItem('policyInceptionDate', policyInceptionDate);
    sessionStorage.setItem('diagnosisDate', diagnosisDate);
    sessionStorage.setItem('selectedOngoingDiseases', JSON.stringify(selectedOngoingDiseases));
    sessionStorage.setItem('smokeDrink', JSON.stringify(smokeDrink));
    sessionStorage.setItem('uploadedFilePaths', JSON.stringify(uploadedFilePaths));
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

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        formData.append('phoneNumber', phoneNumber);
        const toastId = toast.loading(`Uploading ${fileType}...`);

        try {
          const response = await fetch('https://insurebuzz-backend.onrender.com/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
              'Accept': 'application/json', // Specify that you accept JSON responses
            }
          });
        
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
        }        
      } else {
        toast.error('No file selected.');
      }
    };

    input.click();
  };

  const handleCheckboxChange = (option, setSelected, selectedOptions) => {
  if (selectedOptions.includes(option)) {
    // If already selected, remove it
    setSelected(selectedOptions.filter((item) => item !== option));
  } else {
    // If not selected, add it
    setSelected([...selectedOptions, option]);
  }
};

const clearLocalStorage = () => {
    sessionStorage.clear();
  };


  const handleSubmit = () => {
    console.log('Submit button clicked');
    saveInputValues();
  
    if (!uploadedFilePaths['Policy Document']) {
      toast.error("Please upload the policy document before submitting.");
      return;
    }
  
    const formDataObj = {
      policyInceptionDate,
      diagnosisDate,
      selectedOngoingDiseases,
      smokeDrink,
      uploadedFilePaths,
      type: "policy"
    };
  
    console.log(formDataObj);
  
    navigate('/policy-assessment', { state: formDataObj });
  };
  

  const handleBackClick = () => {
    clearLocalStorage();
    navigate(-1);
  };

  return (
    <section className="relative flex flex-col bg-teal-50 bg-gradient-main h-full">
      {/* Logos */}
      <img src={logoUrl} className="absolute top-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute top-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 left-0 w-24 h-24" alt="logo" />
      <img src={logoUrl} className="absolute bottom-0 right-0 w-24 h-24 scale-x-[-1]" alt="logo" />
      <header className="flex flex-wrap gap-5 justify-center items-center self-center max-w-full text-3xl font-bold text-center text-neutral-800 w-[572px]  mt-8">
        <img src='/assets/img/ic_outline-policy.svg' className="w-16 h-16 mr-4" alt="Policy coverage assessment" />
        <h1 className="self-stretch my-auto max-md:max-w-full">Policy coverage assessment</h1>
      </header>
      <div className="flex flex-wrap gap-10 items-start justify-center mt-20 max-md:mt-10 max-md:max-w-full">
      <div className="flex items-center mb-3 cursor-pointer mr-0 mt-0" onClick={handleBackClick}>
    <img src='/assets/img/left-arrow.svg' className="relative w-16 h-16" alt="logo" />
  </div>
        <form className="flex flex-col justify-center items-center px-3 py-14 rounded-xl bg-neutral-50 min-h-[660px] min-w-[240px] shadow-[0px_0px_4px_rgba(0,0,0,0.25)] w-[1042px] max-md:max-w-full">
          <div className="flex overflow-hidden flex-col justify-center items-end px-3 max-w-full w-[962px]">
            <div className="flex flex-wrap gap-8 items-start w-full">
              <DateInput label="Policy inception date" value={policyInceptionDate} onChange={(e) => setPolicyInceptionDate(e.target.value)}
              />
              <DateInput label="Diagnosis date" value={diagnosisDate} onChange={(e) => setDiagnosisDate(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-8 mt-8 items-start w-full">
            <CheckboxGroup
                label="Ongoing diseases"
                options={ongoingDiseases}
                selectedOptions={selectedOngoingDiseases}
                onChange={(option) => handleCheckboxChange(option, setSelectedOngoingDiseases, selectedOngoingDiseases)}
                />
                <CheckboxGroup
                label="Smoke/Drink"
                options={smokingDrinkingOptions}
                selectedOptions={smokeDrink}
                onChange={(option) => handleCheckboxChange(option, setSmokeDrink, smokeDrink)}
                />

            </div>

            <div className="flex flex-wrap gap-8 mt-8 items-start w-full">
              <div className="flex flex-col grow shrink min-w-[240px] w-[326px]">
                <label htmlFor="claim-documents" className="text-xl font-medium leading-snug text-neutral-800">
                  Upload Policy Document
                </label>
                <div className="flex items-center p-3 mt-4 w-full rounded-lg bg-zinc-50 max-w-[408px] shadow-[0px_0px_2px_rgba(0,0,0,1)]">
                  <button
                    type="button"
                    onClick={() => handleFileUploadClick('Policy Document')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Upload Documents
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {uploadedFilesCount}/{totalFiles} files uploaded.
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </section>
  );
}

export default PolicyCoverage;
