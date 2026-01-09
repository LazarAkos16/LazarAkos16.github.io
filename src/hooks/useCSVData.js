import { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Custom hook to load and parse CSV data
 * @param {string} csvPath - Path to CSV file in public folder
 * @returns {Object} { data, loading, error }
 */
export function useCSVData(csvPath) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!csvPath) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCSV = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[useCSVData] Loading CSV from:', csvPath);
        
        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`Failed to load CSV: ${response.statusText} (${response.status})`);
        }

        const text = await response.text();
        console.log('[useCSVData] CSV file loaded, length:', text.length);

        if (cancelled) return;

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (cancelled) return;
            
            console.log('[useCSVData] CSV parsing complete. Raw rows:', results.data.length);
            
            if (results.errors.length > 0) {
              console.warn('[useCSVData] CSV parsing warnings:', results.errors);
            }

            // Process data: convert to appropriate types and filter empty rows
            const processedData = results.data
              .filter(row => {
                if (!row || Object.keys(row).length === 0) return false;
                return Object.values(row).some(val => 
                  val !== null && val !== undefined && String(val).trim() !== ''
                );
              })
              .map((row) => {
                const processedRow = { ...row };
                
                // Auto-detect and convert numeric columns
                Object.keys(processedRow).forEach(key => {
                  const value = processedRow[key];
                  if (value !== null && value !== undefined && value !== '') {
                    const stringValue = String(value).trim();
                    if (stringValue !== '' && !isNaN(stringValue) && isFinite(stringValue)) {
                      const numValue = parseFloat(stringValue);
                      if (!isNaN(numValue) && isFinite(numValue)) {
                        processedRow[key] = numValue;
                      }
                    }
                  }
                });
                
                return processedRow;
              });

            console.log('[useCSVData] Processed data sample:', processedData[0]);
            console.log('[useCSVData] Total processed rows:', processedData.length);
            
            setData(processedData);
            setLoading(false);
          },
          error: (error) => {
            if (cancelled) return;
            console.error('[useCSVData] CSV parsing error:', error);
            setError(error.message || 'Failed to parse CSV');
            setLoading(false);
          }
        });
      } catch (err) {
        if (cancelled) return;
        console.error('[useCSVData] Error loading CSV:', err);
        setError(err.message || 'Failed to load CSV');
        setLoading(false);
      }
    };

    loadCSV();

    return () => {
      cancelled = true;
    };
  }, [csvPath]);

  return { data, loading, error };
}



