import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Example component showing how to load and visualize CSV data
 * 
 * This demonstrates:
 * 1. Loading CSV from public folder
 * 2. Parsing CSV with PapaParse
 * 3. Converting data types
 * 4. Displaying data in a simple table
 */
function CSVVisualizationExample() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCSVData();
  }, []);

  const loadCSVData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch CSV file from public folder
      const response = await fetch('/sample-data.csv');
      
      if (!response.ok) {
        throw new Error('Failed to load CSV file');
      }
      
      const text = await response.text();
      
      // Parse CSV with PapaParse
      Papa.parse(text, {
        header: true, // First row contains headers
        skipEmptyLines: true,
        complete: (results) => {
          // Process the data: convert strings to appropriate types
          const processedData = results.data.map(row => ({
            ...row,
            value: parseFloat(row.value) || 0, // Convert to number
            date: new Date(row.date) // Convert to Date object
          }));
          
          setData(processedData);
          setLoading(false);
        },
        error: (error) => {
          setError(error.message);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Alternative: Load CSV from file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target.result;
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const processedData = results.data.map(row => ({
              ...row,
              value: parseFloat(row.value) || 0,
              date: new Date(row.date)
            }));
            
            setData(processedData);
          },
          error: (error) => {
            setError(error.message);
          }
        });
      };
      
      reader.readAsText(file);
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  if (loading) {
    return <div>Loading CSV data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>CSV Data Example</h3>
      
      {/* File Upload Option */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Upload your own CSV file:
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload}
            style={{ marginLeft: '1rem' }}
          />
        </label>
      </div>

      {/* Display Data */}
      <div>
        <p>Total records: {data.length}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              {data.length > 0 && Object.keys(data[0]).map(key => (
                <th key={key} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i} style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {value instanceof Date ? value.toLocaleDateString() : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      {data.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Statistics:</h4>
          <p>Average value: {(data.reduce((sum, row) => sum + row.value, 0) / data.length).toFixed(2)}</p>
          <p>Max value: {Math.max(...data.map(row => row.value))}</p>
          <p>Min value: {Math.min(...data.map(row => row.value))}</p>
        </div>
      )}
    </div>
  );
}

export default CSVVisualizationExample;

