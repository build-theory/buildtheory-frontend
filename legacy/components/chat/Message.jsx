// frontend/src/components/chat/Message.js

import React from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import ReferenceBadge from './ReferenceBadge'; // Import the ReferenceBadge component

const Message = ({ message, sender, fileUrls, prefetchedPDFs, onReferenceClick }) => { // Added prefetchedPDFs
    const isUser = sender === 'user';

    const typeColorMap = {
        bills: '#1E90FF', // DodgerBlue for bills
        reports: '#32CD32', // LimeGreen for reports
        policy: '#FF4500', // OrangeRed for policy
        discharge_summary: '#8A2BE2', // BlueViolet for discharge summaries
        prescription: '#FFA500' // Orange for prescriptions
    };

    // Function to process the HTML and replace reference spans with ReferenceBadge components
    const processMessage = (htmlString) => {
        const typeCounters = {}; // To keep track of numbering per type
    
        const options = {
            replace: (domNode) => {
                if (domNode.type === 'tag' && domNode.name === 'span') {
                    const { attribs } = domNode;
                    if (attribs && attribs['data-type'] && attribs['data-page']) {
                        const type = attribs['data-type'];
                        const pageNumber = parseInt(attribs['data-page'], 10);
                        const wordToHighlight = attribs['data-word'] || ''; // Extract the word to highlight
    
                        const mappedType = type === 'reports' ? 'test_reports' : type;
                        const pdfDocument = prefetchedPDFs[mappedType];
    
                        if (!pdfDocument) {
                            console.error(`PDF document for type "${type}" (mapped to "${mappedType}") is not loaded.`);
                            return (
                                <span
                                    style={{ color: 'red', cursor: 'not-allowed' }}
                                    title={`Document for "${type}" not available`}
                                >
                                    [i]
                                </span>
                            );
                        }
    
                        // Initialize counter for the type if not present
                        if (!typeCounters[type]) {
                            typeCounters[type] = 1;
                        } else {
                            typeCounters[type] += 1;
                        }
    
                        const number = typeCounters[type];
    
                        return (
                            <ReferenceBadge
                                type={type}
                                number={number}
                                pageNumber={pageNumber}
                                word={wordToHighlight} // Pass the word to highlight
                                pdfDocument={pdfDocument} // Pass the cached pdfjsLib document
                                onClick={onReferenceClick}
                            />
                        );
                    }
                }
            }
        };
    
        return parse(DOMPurify.sanitize(htmlString), options);
    };
    

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
            <div
                className={`relative px-5 py-3 rounded-2xl shadow-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-900'} transition-all duration-300 ease-in-out`}
                style={{ maxWidth: '85%' }}
            >
                {!isUser && (
                    <div className="absolute top-0 right-0 p-1">
                        {/* Information Icon */}
                        <div className="relative group">
                            <span className="inline-block bg-gray-200 text-gray-800 rounded-full p-1 cursor-pointer">
                                <img src="https://img.icons8.com/?size=512&id=2800&format=png" className="h-4 w-4" alt="" />
                            </span>
                            {/* Tooltip */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <div className="p-2 text-sm text-gray-700">
                                    <div className="mb-1">
                                        <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: typeColorMap.bills }}></span>
                                        <span>Bills</span>
                                    </div>
                                    <div className="mb-1">
                                        <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: typeColorMap.reports }}></span>
                                        <span>Reports</span>
                                    </div>
                                    <div className="mb-1">
                                        <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: typeColorMap.policy }}></span>
                                        <span>Policy</span>
                                    </div>
                                    <div className="mb-1">
                                        <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: typeColorMap.discharge_summary }}></span>
                                        <span>Discharge Summary</span>
                                    </div>
                                    <div className="mb-1">
                                        <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: typeColorMap.prescription }}></span>
                                        <span>Prescription</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isUser ? (
                    <p className="text-sm leading-relaxed">{message}</p>
                ) : (
                    <div>
                        <div className="text-sm leading-relaxed">
                            {processMessage(message)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default Message;
