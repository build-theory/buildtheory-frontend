import React, { useState } from 'react';

function ProcessingPage() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleProcessClick = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdf_path: 'path/to/pdf' }), // Update with actual PDF path
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <button onClick={handleProcessClick}>
        {processing ? 'Processing...' : 'Start Processing'}
      </button>
      {error && <p>{error}</p>}
      {results && <div>{JSON.stringify(results)}</div>}
    </div>
  );
}

export default ProcessingPage;
