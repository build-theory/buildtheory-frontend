// ReferenceBadge.js
import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const ReferenceBadge = ({ type, number, pageNumber, pdfDocument, word, onClick }) => {
    const [isHovered, setIsHovered] = useState(false); // Track hover state
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null); // Ref to store the current renderTask

    // Define color mapping for different reference types
    const typeColorMap = {
        bills: '#1E90FF', // DodgerBlue for bills
        reports: '#32CD32', // LimeGreen for reports
        policy: '#FF4500', // OrangeRed for policy
        discharge_summary: '#8A2BE2', // BlueViolet for discharge summaries
        prescription: '#FFA500' // Orange for prescriptions
    };

    // Function to render the preview page
    const renderPagePreview = async () => {
        if (isHovered && pdfDocument) {
            try {
                // Cancel any ongoing render task
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                }

                const page = await pdfDocument.getPage(pageNumber); // Use pdfjsLib document to get page
                const viewport = page.getViewport({ scale: 0.5 }); // Scale down for preview
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render the page into the canvas
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;
                await renderTask.promise;

                // Clear the renderTaskRef after completion
                renderTaskRef.current = null;
            } catch (error) {
                if (error.name !== 'RenderingCancelledException') {
                    console.error("Error rendering PDF preview:", error);
                }
            }
        }
    };

    // Trigger render on hover
    useEffect(() => {
        renderPagePreview();

        // Cleanup function to cancel renderTask if component unmounts or dependencies change
        return () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
        };
    }, [isHovered, pdfDocument, pageNumber]); // Added pageNumber as dependency

    const handleClick = () => {
        if (pdfDocument) {
            onClick(pdfDocument, pageNumber, word); // Pass cached pdfjsLib document to the modal
        }
    };

    return (
        <span
            className="reference-badge relative cursor-pointer flex justify-center items-center"
            style={{
                backgroundColor: typeColorMap[type] || '#000000',
                borderRadius: '50%',
                width: '1rem',   // Adjust width to give more space for the number
                height: '1rem',  // Adjust height to match width
                color: '#fff',   // Ensure the number color is white for contrast
                fontWeight: 'bold',
                fontSize: '0.75rem', // Adjust the font size to ensure visibility
                textAlign: 'center',
                margin: 'auto'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick} // Trigger modal on click
            role="button"
            tabIndex="0"
            title={`Page ${pageNumber}, Word: "${word}"`}
        >
            <i>{number}</i>

            {/* Hover Preview Container */}
            {isHovered && (
                <div
                    className="absolute z-50 bg-white border shadow-lg p-2"
                    style={{
                        width: '300px',  // Small preview size
                        height: '400px', // Adjust height for preview
                        top: '110%',     // Position slightly below the badge
                        left: '0',
                        zIndex: 1000     // Ensure the preview is on top of other elements
                    }}
                >
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                </div>
            )}
        </span>
    );
};

export default ReferenceBadge;
