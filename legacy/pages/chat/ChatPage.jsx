// ChatPage.js
import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { json } from 'react-router-dom';

const ChatPage = () => {
    const [namesList, setNamesList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedName, setSelectedName] = useState(null);
    const [chatEnabled, setChatEnabled] = useState(false); // Controls chat button visibility
    const [showChatWindow, setShowChatWindow] = useState(false); // Controls chat window visibility
    const [fileURLs, setFileURLs] = useState({}); // Stores file URLs mapped by document type
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({}); // Track selected files by document type
    const [selectedFileContent, setSelectedFileContent] = useState(null); // Properly declare selectedFile
    const [phoneNumber, setPhoneNumber] = useState('');

    const fetchPolicyNames = async () => {
        try {
            const response = await fetch('https://insurebuzz-backend.onrender.com/get-patient-names', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Fetched Names:', data.data);
            setNamesList(data.data);
        } catch (error) {
            console.error('Error fetching names:', error);
            toast.error("Failed to fetch patient names.");
        }
    };

    const fetchFiles = async (phoneNumber) => {
        setLoadingFiles(true);
        try {
            const response = await fetch(`https://insurebuzz-backend.onrender.com/get-files/${phoneNumber}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Fetched Files:', data.data);
            setFiles(data.data);
            setChatEnabled(true); // Enable chat button after fetching files
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error("Failed to fetch files for the selected patient.");
        } finally {
            setLoadingFiles(false);  // Stop loading state after fetch is complete
        }
    };

    const handleNameClick = (item) => {
        setSelectedName(item);
        fetchFiles(item.subfolder_name); // Fetch files for the selected name
    };

    const generateFileURLs = (filePaths) => {
        const baseUrl = "https://insurebuzz-backend.onrender.com";
        const fileUrls = {};

        for (const [key, path] of Object.entries(filePaths)) {
            // Extract the filename from the path
            const fileName = path.replace(`/var/data/`,'');
            const encodedFileName = encodeURIComponent(fileName); // Handle spaces and special characters
            const fileUrl = `${baseUrl}/files/${encodedFileName}`;
            fileUrls[key] = fileUrl; // e.g., "policy": "https://.../Manipal base policy.pdf"
        }
        console.log("Generated File URLs: ", fileUrls);
        return fileUrls;
    };

    // Handle file selection and toggle selected keys (e.g., policy, bills, etc.)
    const handleFileSelection = (fileKey) => {
        setSelectedFiles((prevSelectedFiles) => ({
            ...prevSelectedFiles,
            [fileKey]: !prevSelectedFiles[fileKey] // Toggle selection of the key (fileKey is the key like 'policy', 'bills', etc.)
        }));
        console.log("Updated Selected Files: ", selectedFiles);
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            // Select all files
            const allSelected = files.reduce((acc, file) => {
                const fileKey = file.doc_type;
                if (fileKey) {
                    acc[fileKey] = true; // Mark each file as selected
                }
                return acc;
            }, {});
            setSelectedFiles(allSelected);
        } else {
            // Deselect all files
            setSelectedFiles({});
        }
    };
    

    const startChat = async () => {

        if (phoneNumber) {
            try {
                const response = await fetch(`https://insurebuzz-backend.onrender.com/files/${phoneNumber}/extraction_results.json`);
                if (!response.ok) {
                    throw new Error('Failed to fetch JSON file content');
                }
                const jsonData = await response.json();
                if (!jsonData.file_paths) {
                    throw new Error('Invalid JSON structure: Missing file_paths');
                }

                const fileUrls = generateFileURLs(jsonData.file_paths);
                setFileURLs(fileUrls);

                // Prepare the file content by mapping selected files and setting others to null
                const filteredData = Object.keys(fileUrls).reduce((acc, key) => {
                    if (selectedFiles[key]) {
                        acc[key] = jsonData[key] || null; // Keep the selected key data or set to null if not present
                        if (key === 'bills') {
                            acc['bills_with_claim'] = null; // Explicitly set bills_with_claim to null
                        }
                    } else {
                        acc[key] = null; // Set non-selected keys to null
                        if (key === 'bills') {
                            acc['bills_with_claim'] = null; // Ensure bills_with_claim is always null
                        }
                    }
                    return acc;
                }, {});

                console.log("Filtered data (with null for non-selected keys):", filteredData);

                // Check for any null keys and notify the user
                // const missingFiles = Object.keys(filteredData).filter(key => filteredData[key] === null && key !== 'bills_with_claim');
                // if (missingFiles.length > 0) {
                //     missingFiles.forEach(fileKey => {
                //         toast.warn(`The "${fileKey.replace('_', ' ')}" file is not selected or missing. Please select or provide it for analysis.`);
                //     });
                // }

                // Pass the entire JSON content to the chat window, but with selected keys and nulls for others
                setShowChatWindow(true);
                setSelectedFileContent({ ...jsonData, ...filteredData }); // Properly set selectedFileContent
            } catch (error) {
                console.error("Error fetching JSON file content:", error);
                toast.error("Failed to process the JSON file.");
            }
        } else {
            console.error("No JSON file found for this patient");
            toast.error("No JSON file available for the selected patient.");
        }
    };


    return (
        <div className="flex flex-col h-screen">
            <ToastContainer />

            <div className="flex h-full">
                {/* Left Section: Shows either patient names or files */}

                <div className="w-1/4 bg-[#EFF3F6] p-4 rounded-2xl my-4 mx-2 overflow-y-auto">
                    <div className="flex items-center justify-center text-white p-4">
                        <img src="assets/img/logo.svg" alt="InsureBuzz AI Logo" className="h-10 w-10 mr-4" />
                        <h1 className="text-xl font-bold text-[#26262A]">INSUREBUZZ AI</h1>
                    </div>
                    {!selectedName ? (
                        <>
                            <h2 className="text-lg font-bold mb-4 text-[#26262A] text-center">Patient Names</h2>
                            <div className="relative flex items-center w-full mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name..."
                                    className="w-full p-2 pl-10 border rounded-lg shadow-md"
                                />
                                <span className="absolute left-3 text-gray-400">
                                    <FontAwesomeIcon icon={faSearch} className="h-4 w-4 " />
                                </span>
                            </div>


                            <button
                                onClick={fetchPolicyNames}
                                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-2 px-5 rounded-3xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-103 m-auto block"
                                >
                                Fetch Names
                                </button>


                            <ul className="mt-4">
                            {namesList.length > 0 ? (
                                namesList
                                    .filter(item => item.subfolder_name !== 'data')
                                    .filter(item =>
                                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((item, index) => (
                                    <li
                                        key={index}
                                        className="mt-4 p-4 border border-gray-200 rounded-lg shadow-md bg-white hover:bg-blue-50 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                                        onClick={() => {
                                            handleNameClick(item);
                                            setPhoneNumber(item.subfolder_name);
                                          }}
                                    >
                                        <div className="flex flex-col">
                                        <span className="text-lg font-bold text-[#26262A]">{item.name}</span>
                                        <span className="text-sm text-gray-500">Number: {item.subfolder_name}</span>
                                        </div>
                                    </li>
                                    ))
                                ) : (
                                <p className="text-gray-500 text-center">No names fetched yet</p>
                                )}


                            </ul>
                        </>
                    ) : (
                        <>
    <button
        onClick={() => {
            setSelectedName(null);
            setFiles([]); // Clear files when going back
            setChatEnabled(false); // Disable chat button when going back
            setSelectedFileContent(null); // Clear selected file content
            setShowChatWindow(false);
        }}
        className="bg-red-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-red-600 shadow-lg transition duration-300 ease-in-out mb-6 mx-auto block"
    >
        Back
    </button>

    <h3 className="text-2xl font-bold mb-6 text-gray-800">Files for {selectedName.name}</h3>

    {loadingFiles ? (
        <div className="flex justify-center items-center h-20">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-8 rounded-full" role="status">
                <span className="text-2xl">•</span>
            </div>
        </div>
    ) : (
        <div>
            <h4 className="text-lg font-semibold mb-2">Select Files to Analyze:</h4>
            {/* Select All Checkbox */}
            <div className="flex justify-self-end items-center p-1 pr-4 border border-gray-200 rounded-lg shadow-md mb-4 w-auto">
                <label className="flex items-center cursor-pointer">
                    
                    
                    <span className="text-sm mx-2 text-gray-500">Select All</span>
                    <input
                        type="checkbox"
                        checked={Object.keys(selectedFiles).length === files.length} // Check if all files are selected
                        onChange={(e) => handleSelectAll(e.target.checked)} // Handle "Select All" logic
                        className="sr-only"
                    />
                    <span
                        className={`h-6 w-6 border border-blue-500 rounded flex items-center justify-center transition-colors duration-200 ${
                            Object.keys(selectedFiles).length === files.length ? 'bg-blue-500' : 'bg-[#EEFCFB]'
                        }`}
                    >
                        {Object.keys(selectedFiles).length === files.length && (
                            <svg className="w-4 h-4 text-white" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </span>
                </label>
            </div>
            <ul className="space-y-4">
                {files.length > 0 ? (
                    files.map((file, index) => {
                        const fileKey = file.doc_type;
                        if (!fileKey) return null; 
                        return (
                            <li
                                key={index}
                                className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                            >
                                {/* Profile/Document Icon */}
                                <div className="mr-4 text-blue-500">
                                    <img src='https://cdn-icons-png.flaticon.com/512/2258/2258853.png' className='w-6 h-6 ' alt="Document Icon"></img>
                                </div>

                                {/* File Name without underline */}
                                <a
                                    href={`https://insurebuzz-backend.onrender.com${file.url.replace('/var/data','/files')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-700 font-normal truncate max-w-xs"
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {file.name} {/* Show the actual file name */}
                                </a>

                                {/* Checkbox on the right */}
                                <label className="ml-auto flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!selectedFiles[fileKey]} // Check if the file is selected
                                        onChange={() => handleFileSelection(fileKey)} // Handle selection by fileKey
                                        className="sr-only" // Hide the actual checkbox
                                    />
                                    <span
                                        className={`h-6 w-6 border border-blue-500 rounded flex items-center justify-center transition-colors duration-200 ${
                                            selectedFiles[fileKey] ? 'bg-blue-500' : 'bg-[#EEFCFB]'
                                        }`}
                                    >
                                        {selectedFiles[fileKey] && (
                                            <svg className="w-4 h-4 text-white" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </span>
                                </label>

                            </li>
                        );
                    })
                ) : (
                    <p className="text-gray-500">No files found</p>
                )}
            </ul>
        </div>
    )}


                    </>
    

                    )}
                </div>

                {/* Right Section: Disabled "Start Chat" button initially */}
                <div className="w-3/4 h-full p-4 flex flex-col justify-center items-center rounded-3xl overflow-hidden">
  {!showChatWindow && (
    <button
      onClick={startChat}
      disabled={!chatEnabled}
      className={`bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 ${!chatEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      Start Chat
    </button>
  )}

  {showChatWindow && (
    <div className="w-full h-full rounded-3xl overflow-hidden">
      <ChatWindow selectedName={selectedName} fileContent={selectedFileContent} fileUrls={fileURLs} />
    </div>
  )}
</div>

            </div>
        </div>
    );
};

export default ChatPage;
