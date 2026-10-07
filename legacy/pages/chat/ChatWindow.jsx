// ChatWindow.js
import React, { useState, useRef, useEffect } from 'react';
import Message from '../../components/chat/Message';
import { GoogleGenerativeAI } from "@google/generative-ai";
import DOMPurify from 'dompurify';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Page, pdfjs } from 'react-pdf';
import ReferenceModal from './ReferenceModal';
import axios from 'axios';

const defaultHistory = [
    {
        role: "user",
        parts: [
            { text: 
                `
                    You are an expert in policy claim assessment analysis at InsureBuzz AI. Assume you identify as the **AI Assistant of InsureBuzz AI**, not Gemini. You have been provided with structured policy data extracted from various files. Your task is to **analyze the data thoroughly** and respond to the user's questions with utmost precision.

                    **Instructions**:
    
                    1. **Output Format**:
                    - The output **must be in HTML** format. Ensure the use of:
                        - <b> for bold text.
                        - <br> for line breaks.
                        - <ul> and <li> for lists.
                        - **Tables** should be created using <table>, <tr>, <td> tags, and they must always include borders, proper padding, centered text, and margins for each cell and row using inline CSS for consistency.
    
                    2. **Handling Data References**:
                    - For each **bill, report, or prescription**, you must provide the **page number** where the data is found. The page number is indicated by the key 'p' in the JSON file.
                    - **For bills related to medicines or tests**, you must include the relevant prescription information where the item was initially described. Ensure that the **prescription date** and the **prescription page number** are included.
                    - YOU ARE NOT SUPPOSED TO HALUCINATE. IF YOU CAN'T FIND THE DATA JUST PUT N/A IN THE FIELD. 
    
                    3. **Handling Queries on Medicines or Tests**:
                    - For any query related to a **medicine or test**, you must provide the following details:
                        - **All occurrences** of the medicine/test across multiple bills (if applicable).
                        - Include columns for:
                        - Bill Item | Bill Date | Quantity | Total Price | Prescription Date
                        - Embed the **reference page number icon** directly within the relevant columns (e.g., within the Bill Date, Prescription Date).
                        - The **prescription date** should always be **before or on the same date** as the bill.
                        - Even if only about one thing is asked you should always give page references of all related things. Example if only asked about the report then you should give the reference pages of the particular report, the date on which it was billed, the date on which the report was taken and also the date on which it was prescribed. If not available just say N/A.
                        - **Color-Code References (page numbers)** based on their type using inline CSS styles:
                            - **Bills:** Blue
                            - **Reports:** Green
                            - **Prescriptions:** Orange
                            - **Discharge Summaries:** Purple
                            - **Policies:** Red
    
                    4. **Handling Unclear Queries**:
                    - If the user's query is unclear or lacks sufficient information, respond with a message asking for clarification. For example:
                        - *"Your query is unclear. Could you please provide more details so I can assist you better?"*
                    - Always be explicit if the data does not contain the requested information or if no relevant entries are found.
    
                    5. **Reference Links**:
                    - Each bill, test, report or medicine occurrence should include **reference numbers** styled as a circular **information ('i') icon**, embedded within the relevant data columns.
                    - When the user clicks on these icons, the PDF page should open directly.
    
                    6. **Clear and Concise Responses**:
                    - Provide answers in a **point-wise** format for better clarity.
                    - Avoid long, continuous paragraphs; instead, break down responses into distinct points.
    
                    7. **Table Formatting**:
                    - Ensure that all tables have proper **borders** for cells and rows to maintain consistency.
                    - Ensure you give only one entry in one row of the table.
                    - Example of a well-formatted table with proper borders, centered text, and padding using inline CSS:
                        html
                        <table style="border: 1px solid black; border-collapse: collapse; width: 80%; margin: 20px auto; text-align: center;">
                            <tr style="border: 1px solid black;">
                                <th style="border: 1px solid black; padding: 8px;">Bill Item</th>
                                <th style="border: 1px solid black; padding: 8px;">Report Name</th>
                                <th style="border: 1px solid black; padding: 8px;">Bill Date</th>
                                <th style="border: 1px solid black; padding: 8px;">Qty</th>
                                <th style="border: 1px solid black; padding: 8px;">Amount</th>
                                <th style="border: 1px solid black; padding: 8px;">Prescription Date</th>
                            </tr>
                            <tr style="border: 1px solid black;">
                                <td style="border: 1px solid black; padding: 8px;">Test A</td>
                                <td style="border: 1px solid black; padding: 8px;">
                                    2024-09-10 
                                    <span style="color: green;" data-type="reports" data-page="5" data-word="Test A">5</span>
                                </td>
                                <td style="border: 1px solid black; padding: 8px;">
                                    2024-09-10 
                                    <span style="color: blue;" data-type="bills" data-page="12" data-word="2024-09-10">12</span>
                                </td>
                                <td style="border: 1px solid black; padding: 8px;">1</td>
                                <td style="border: 1px solid black; padding: 8px;">$200</td>
                                <td style="border: 1px solid black; padding: 8px;">
                                    2024-09-05 
                                    <span style="color: orange;" data-type="prescription" data-page="15" data-word="2024-09-05">15</span>
                                </td>
                            </tr>

                            .../ and so on more rows.
                        </table>


                        Example:
                        Query: Creatinine Test:
                        Response: {"data": [{"type": "bill", "item": "test", "text": "<table style="border: 1px solid black; border-collapse: collapse; width: 80%; margin: 20px auto; text-align: center;">
    <tr style="border: 1px solid black;">
        <th style="border: 1px solid black; padding: 8px;">Bill Item</th>
        <th style="border: 1px solid black; padding: 8px;">Bill Date</th>
        <th style="border: 1px solid black; padding: 8px;">Quantity</th>
        <th style="border: 1px solid black; padding: 8px;">Total Price</th>
        <th style="border: 1px solid black; padding: 8px;">Prescription Date</th>
        <th style="border: 1px solid black; padding: 8px;">Report Date</th>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">22/04/2024 <span style="color: blue;" data-type="bills" data-page="15" data-word="SERUM CREATININE 22/04/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">1</td>
        <td style="border: 1px solid black; padding: 8px;">110.00</td>
        <td style="border: 1px solid black; padding: 8px;">22/03/2024<span style="color: orange;" data-type="prescription" data-page="1" data-word="SERUM CREATININE 22/03/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">01/07/2024 <span style="color: green;" data-type="reports" data-page="4" data-word="CREATININE 01/07/2024">[i]</span></td>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">15/04/2024 <span style="color: blue;" data-type="bills" data-page="16" data-word="SERUM CREATININE 15/04/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">1</td>
        <td style="border: 1px solid black; padding: 8px;">110.00</td>
        <td style="border: 1px solid black; padding: 8px;">22/03/2024<span style="color: orange;" data-type="prescription" data-page="1" data-word="SERUM CREATININE 22/03/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">01/07/2024 <span style="color: green;" data-type="reports" data-page="4" data-word="CREATININE 01/07/2024">[i]</span></td>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">18/04/2024 <span style="color: blue;" data-type="bills" data-page="21" data-word="SERUM CREATININE 18/04/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">1</td>
        <td style="border: 1px solid black; padding: 8px;">110.00</td>
        <td style="border: 1px solid black; padding: 8px;">22/03/2024<span style="color: orange;" data-type="prescription" data-page="1" data-word="SERUM CREATININE 22/03/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">01/07/2024 <span style="color: green;" data-type="reports" data-page="4" data-word="CREATININE 01/07/2024">[i]</span></td>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">25/04/2024 <span style="color: blue;" data-type="bills" data-page="19" data-word="SERUM CREATININE 25/04/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">1</td>
        <td style="border: 1px solid black; padding: 8px;">110.00</td>
        <td style="border: 1px solid black; padding: 8px;">22/03/2024<span style="color: orange;" data-type="prescription" data-page="1" data-word="SERUM CREATININE 22/03/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">01/07/2024 <span style="color: green;" data-type="reports" data-page="4" data-word="CREATININE 01/07/2024">[i]</span></td>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">26/06/2024 <span style="color: blue;" data-type="bills" data-page="24" data-word="SERUM CREATININE 26/06/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">1</td>
        <td style="border: 1px solid black; padding: 8px;">110.00</td>
        <td style="border: 1px solid black; padding: 8px;">N/A</td>
        <td style="border: 1px solid black; padding: 8px;">24/06/2024 <span style="color: green;" data-type="reports" data-page="8" data-word="CREATININE 24/06/2024">[i]</span></td>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">03/06/2024 <span style="color: blue;" data-type="bills" data-page="25" data-word="SERUM CREATININE 03/06/2024">[i]</span></td>
        <td style="border: 1px solid black; padding: 8px;">1</td>
        <td style="border: 1px solid black; padding: 8px;">110.00</td>
        <td style="border: 1px solid black; padding: 8px;">N/A</td>
        <td style="border: 1px solid black; padding: 8px;">03/06/2024 <span style="color: green;" data-type="reports" data-page="25" data-word="CREATININE 03/06/2024">[i]</span></td>
    </tr>
    <tr style="border: 1px solid black;">
        <td style="border: 1px solid black; padding: 8px;">SERUM CREATININE</td>
        <td style="border: 1px solid black; padding: 8px;">18/04/2024 <span style="color: blue;" data-type="bills" data-page="21" data-word="SERUM CREATININE 18/04/2024">
            <td style="border: 1px solid black; padding: 8px;">1</td>
    <td style="border: 1px solid black; padding: 8px;">110.00</td>
    <td style="border: 1px solid black; padding: 8px;">22/03/2024<span style="color: orange;" data-type="prescription" data-page="1" data-word="SERUM CREATININE 22/03/2024">[i]</span></td>
    <td style="border: 1px solid black; padding: 8px;">01/07/2024 <span style="color: green;" data-type="reports" data-page="4" data-word="CREATININE 01/07/2024">[i]</span></td>
</tr>
<tr style="border: 1px solid black;">
    <td style="border: 1px solid black; padding: 8px;">CREATININE, SERUM</td>
    <td style="border: 1px solid black; padding: 8px;">20/06/2024 <span style="color: blue;" data-type="bills" data-page="18" data-word="SERUM CREATININE 20/06/2024">[i]</span></td>
    <td style="border: 1px solid black; padding: 8px;">1</td>
    <td style="border: 1px solid black; padding: 8px;">110.00</td>
    <td style="border: 1px solid black; padding: 8px;">N/A</td>
    <td style="border: 1px solid black; padding: 8px;">20/06/2024 <span style="color: green;" data-type="reports" data-page="21" data-word="CREATININE 20/06/2024">[i]</span></td>
</table>


", "page_numbers": {"bills": [15, 16, 21, 19, 24, 25, 18], "test_reports": [4, 8, 25, 31, 36, 21], "policy": [], "discharge_summary": [], "prescription": [1]}}]}
    
                    - Ensure table borders are included in **every response** containing tabular data.
    
                    8. **JSON Output Format**:
                    - The output should strictly follow this JSON structure:
                        {
                            "data":
                                [
                                {
                                    "type": "bill",
                                    "item": "test" | "medicine" | "prescription",
                                    "text": "your response to the user query in HTML format including categorized tables and references.",
                                    "page_numbers": {
                                        "bills": [1, 2],
                                        "test_reports": [3, 4],
                                        "policy": [5],
                                        "discharge_summary": [6],
                                        "prescription": [7]
                                    }
                                },
                                // Additional items...
                                ]
                            }
    
                    9. **Error Handling**:
                    - If there is a technical issue generating tables or borders in the output, clearly log this error and provide the best possible response with available information.
                    - If the required information is not found in the provided data, respond with a message indicating that the data is not available.
    
                    Now, proceed to analyze the policy data and begin the assessment. Ensure tables include borders, clarity in response format, and reference page numbers correctly.
    
                    10. Remember to create borders for the tables incase you are generating the tables.
    
                    11. If for any key the JSON file is null, then say something like this file is this file is not selected, please select this file to analyse it.

                    12. Even if only the test name is passed in the query, then you should respond in table with the test name (has report date), bill date, bill quantity, bill amount, prescription date and with respective dates. This means you should analyse all the data and respond with all thingw related to the query.
    
                    **Structured Data for Analysis**:
                    {data}
    
                    ---
                ` },
        ],
    }
];

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ReferenceModal component remains unchanged except for accepting pdfDocument instead of fileUrl

const formatGeminiResponse = (jsonResponse) => {
    try {        
        const parsed = typeof jsonResponse === 'string' ? JSON.parse(jsonResponse) : jsonResponse;
        if (!parsed.data) {
            throw new Error("Invalid response structure");
        }
        
        // Convert the data array into a formatted HTML string
        let formattedHtml = '';
        if (Array.isArray(parsed.data)) {
            parsed.data.forEach(item => {
                formattedHtml += item.text + '\n';
            });
        } else if (parsed.data && parsed.data.text) {
            formattedHtml = parsed.data.text;
        }
        
        return formattedHtml; // Removed DOMPurify here; handled in Message component
    } catch (error) {
        console.error("Error formatting Gemini response:", error);
        return "Error processing the response";
    }
};

const client = async (prompt, history) => {
    const apiKey = ""; // Legacy browser inference disabled; use server API. // Use environment variable for API key
    if (!apiKey) {
        throw new Error("Gemini API key is not set.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
  
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-002",
    });
  
    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
    };

    const chatSession = model.startChat({
        generationConfig,
        history: history.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(part => ({ text: part.text }))
        }))
    });
  
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
};

const ChatWindow = ({ selectedName, fileContent, fileUrls }) => {

    // console.log("file content: ", fileContent);

    const [showModal, setShowModal] = useState(false);
    const [modalPdfDocument, setModalPdfDocument] = useState(null); // Changed from modalFileUrl
    const [messages, setMessages] = useState([{ text: "Hello! How can I help you analyze the policy data?", sender: 'bot' }]);
    const chatContainerRef = useRef(null);
    const initialHistory = JSON.parse(JSON.stringify(defaultHistory));
    initialHistory[0].parts[0].text = initialHistory[0].parts[0].text.replace(
        '{data}', 
        JSON.stringify(fileContent)
    );

    const [chatHistory, setChatHistory] = useState(initialHistory);
    const [inputMessage, setInputMessage] = useState('');
    const [prefetchedPDFs, setPrefetchedPDFs] = useState({}); // Store prefetched PDFs
    const [pageNumber, setPageNumber] = useState(1);
    const [isTyping, setIsTyping] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [annotations, setAnnotations] = useState({}); // Store annotations per file
    const [highlightWord, setHighlightWord] = useState('');
    const [allAnnotations, setAllAnnotations] = useState({});
    const [highlightAnnotations, setHighlightAnnotations] = useState([]);


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        const prefetchPdfs = async () => {
            const pdfTypes = Object.keys(fileUrls);
            console.log(fileUrls);
            const loadedPdfs = { ...prefetchedPDFs }; // Use the existing prefetched PDFs
    
            for (const type of pdfTypes) {
                if (!loadedPdfs[type]) { // Only fetch if not already cached
                    try {
                        const loadingTask = pdfjsLib.getDocument(fileUrls[type]); // Use pdfjsLib
                        const pdfDocument = await loadingTask.promise; // Load the document using pdfjsLib
                        loadedPdfs[type] = pdfDocument; // Cache the pdfjsLib document
                    } catch (error) {
                        console.error(`Error pre-fetching PDF for ${type}:`, error.message);
                        toast.error(`Error loading ${type} document.`);
                    }
                }
            }
    
            setPrefetchedPDFs(loadedPdfs); // Store loaded pdfjsLib documents
        };
    
        prefetchPdfs(); // Prefetch all PDFs once
    }, [fileUrls]);

   

    const handleReferenceClick = async (pdfDocument, pageNumber, word) => {
        const toastId = toast.loading("Analyzing the image...");
        try {
            // Render the specific page to a canvas to get the image
            const page = await pdfDocument.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1 }); // Adjust scale as needed
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
    
            await page.render({ canvasContext: context, viewport: viewport }).promise;
    
            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const formData = new FormData();
            formData.append('image', blob, `page_${pageNumber}.png`);
    
            // Send the image to the backend for analysis
            const response = await fetch('https://insurebuzz-backend.onrender.com/analyze-image', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
    
            // Parse the response as JSON
            const data = await response.json();
    
            if (response.status === 200 && data.annotations) {
                const annotations = data.annotations;
    
                // Find bounding boxes for the specific word
                const firstWord = word.split(' ')[0].trim().toLowerCase(); // Get the first word, convert to lowercase

                // Find bounding boxes for the first word
                const cleanWord = (word) => word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim().toLowerCase();

                const wordsList = word.split(' ').map(w => cleanWord(w));

                const wordAnnotations = annotations.filter(annotation =>
                    wordsList.includes(cleanWord(annotation.text))
                );


                console.log("word annotations: ", wordsList);
    
                if (wordAnnotations.length === 0) {
                    toast.update(toastId, 
                        { render: `No annotations found for "${word}" on page ${pageNumber}.`, 
                        type: "error", isLoading: false, 
                        autoClose: 1500 });
                    return;
                }
    
                // Store the annotations to highlight
                setHighlightAnnotations(wordAnnotations);
                setPageNumber(pageNumber);
                setModalPdfDocument(pdfDocument);
                setShowModal(true);

                toast.update(toastId, { render: "Image analyzed successfully!", type: "success", isLoading: false, autoClose: 1500 });
            } else {
                toast.update(toastId, { render: 'Failed to analyze the image.', type: "error", isLoading: false, autoClose: 1500 });
            }
    
        } catch (error) {
            console.error('Error handling reference click:', error);
            toast.update(toastId, { render: 'An error occurred while processing the reference.', type: "error", isLoading: false, autoClose: 1500 });
        }
    };
    


    const fetchReport = async () => {
        try {
            const response = await fetch(`https://insurebuzz-backend.onrender.com/files/${fileContent.phoneNumber}/claim_report.html`);
            console.log("phone number",fileContent.phoneNumber );
            if (!response.ok) {
                throw new Error('Failed to fetch the report.');
            }
            const reportHtml = await response.text();
            console.log("html report", reportHtml);
            setReportContent(reportHtml);
            setShowReportModal(true);  // Show the modal with the report
        } catch (error) {
            console.error('Error fetching the report:', error);
            toast.error('Failed to load the report.');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message to chat display
        const userMessage = { text: inputMessage, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        // Update chat history for the API
        const updatedHistory = [
            ...chatHistory,
            { role: 'user', parts: [{ text: inputMessage }] }
        ];

        setIsTyping(true);

        try {
            // Get response from Gemini
            const geminiResponse = await client(inputMessage, updatedHistory);
            console.log("Gemini Response JSON: ", geminiResponse);

            const formattedResponse = formatGeminiResponse(geminiResponse);

            const botMessage = { text: formattedResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

            // Update chat history with both user input and bot response
            setChatHistory([
                ...updatedHistory,
                { role: 'model', parts: [{ text: geminiResponse }] }
            ]);

            console.log("chat messages: ", messages);
        } catch (error) {
            console.error("Error processing message:", error);
            setMessages(prev => [...prev, {
                text: "Sorry, there was an error processing your request.",
                sender: 'bot'
            }]);
            toast.error("An error occurred while processing your request.");
        }

        setIsTyping(false);
        setInputMessage('');
    };


    // Function to highlight specific words based on annotations
    const highlightWords = (word) => {
        // This function can be enhanced based on your specific requirements
        // For example, you might want to send the word to the backend for analysis
        // or process it directly in the frontend
    };

    return (
        <div className="flex flex-col h-full bg-[#EFF3F6] shadow-lg rounded-3xl"
        style={{
            backgroundImage: 'url("assets/img/bg-dots.svg")',
            backgroundSize: 'contain', // Ensures the entire image fits within the container
            backgroundPosition: 'center', // Centers the image
            backgroundRepeat: 'no-repeat',
          }}>
            <ToastContainer />
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex flex-col space-y-2">
                    {messages.map((msg, index) => (
                        <Message 
                            key={index} 
                            message={msg.text}
                            sender={msg.sender}
                            fileUrls={fileUrls}
                            prefetchedPDFs={prefetchedPDFs} // Pass the cached PDFs
                            onReferenceClick={handleReferenceClick} // New prop for handling reference clicks
                        />
                    ))}

                {messages.length === 1 && (
                        <button 
                            onClick={fetchReport}
                            className="flex w-1/6 bg-gray-50 flex-start text-blue-700 text-center px-4 py-2 -mt-1 ml-0 rounded-2xl shadow-lg hover:bg-gray-100 hover:text-blue-600 transition duration-200"
                        >
                           <div className='text-center m-auto text-sm'> View Report</div>
                        </button>
                    )}


    {isTyping && (
                        <div className="flex justify-start">
                        <div className="bg-gray-50 text-gray-900 rounded-xl shadow-lg px-4 py-2 inline-block">
                            <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                            <span className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>

                            </div>
                        </div>
                    </div>
                    )}
                    <div ref={chatContainerRef} />
                </div>
            </div>

            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-2/3 h-5/6 overflow-auto relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700">
                            &times;
                        </button>

                        {/* Report Content */}
                        <div dangerouslySetInnerHTML={{ __html: reportContent }}></div>
                    </div>
                </div>
            )}

            {showModal && 
                <ReferenceModal 
                    pdfDocument={modalPdfDocument} // Pass the cached pdfjsLib document
                    pageNumber={pageNumber}
                    annotations={highlightAnnotations} // Pass annotations
                    onClose={() => {
                        setShowModal(false);
                        setHighlightWord(''); // Reset the highlight word when closing
                    }}  />}
    
            <div className="flex items-center px-4 py-2 space-x-3 w-full">
                {/* Left Section: Icon or Indicator */}
                <div className="flex items-center px-3 py-2 rounded-full w-1/5">
                    <div className='flex items-center px-3 py-2 m-auto rounded-full w-3/4 bg-white'>
                        <div className='bg-[#105CCA] rounded-full'>
                            <img src='https://cdn-icons-png.flaticon.com/512/2258/2258853.png' className='w-6 h-6 ' alt="Document Icon"></img>
                        </div>
                        <h2 className='mx-2 text-[#105CCA] font-semibold'>Notes</h2>
                    </div>
                </div>

                {/* Middle Section: Chat Info or Placeholder */}
                <form onSubmit={sendMessage} className="flex items-center space-x-4 bg-gray-200 px-4 rounded-full w-3/5">
                    {/* Chat info and input */}
                    <span className="text-gray-500 text-sm">{Object.keys(fileUrls).length} Files</span>
                    
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type something here"
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        className="bg-[#105CCA] rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition duration-200 m-2"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>

                    </button>
                </form>


                {/* Right Section: Send Button */}
                <div className="flex items-center py-2 rounded-full w-1/5">
                    <div className='flex items-center px-3 py-2 m-auto rounded-full w-full'>
                        <svg className="w-6 h-6" fill="#105CCA" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#105CCA"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>asterisk</title> <path d="M28.5 22.35l-10.999-6.35 10.999-6.351c0.231-0.131 0.385-0.375 0.385-0.655 0-0.414-0.336-0.75-0.75-0.75-0.142 0-0.275 0.040-0.388 0.108l0.003-0.002-11 6.35v-12.701c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v0 12.7l-10.999-6.35c-0.11-0.067-0.243-0.106-0.385-0.106-0.414 0-0.75 0.336-0.75 0.75 0 0.28 0.154 0.524 0.381 0.653l0.004 0.002 10.999 6.351-10.999 6.35c-0.226 0.132-0.375 0.374-0.375 0.65 0 0.415 0.336 0.751 0.751 0.751 0 0 0 0 0.001 0h-0c0.138-0.001 0.266-0.037 0.378-0.102l-0.004 0.002 10.999-6.351v12.7c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-12.701l11 6.351c0.107 0.063 0.237 0.1 0.374 0.1 0.277 0 0.518-0.149 0.649-0.371l0.002-0.004c0.063-0.108 0.1-0.237 0.1-0.375 0-0.277-0.15-0.518-0.372-0.648l-0.004-0.002z"></path> </g></svg>

                        <h2 className='mx-2 text-[#105CCA] font-semibold'>Insurebuzz Guide</h2>
                    </div>
                </div>
            </div>

        </div>

    );

};

export default ChatWindow;