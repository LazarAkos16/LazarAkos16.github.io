import React, { useEffect, useRef } from 'react';
import Papa from 'papaparse';

/**
 * CSVLoader - A reusable component for loading and parsing CSV data
 * This component doesn't render anything - it just loads data and calls callbacks
 */
function CSVLoader({ csvPath, onDataLoaded, onError }) {
  // Use refs to store callbacks to avoid dependency issues
  const onDataLoadedRef = useRef(onDataLoaded);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded;
    onErrorRef.current = onError;
  }, [onDataLoaded, onError]);
  
  useEffect(() => {
    if (!csvPath) {
      return;
    }
    
    let cancelled = false;
    
    const loadCSV = async () => {
      try {
        console.log('[CSVLoader] Loading CSV from:', csvPath);
        
        // Fetch CSV file
        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`Failed to load CSV: ${response.statusText} (${response.status})`);
        }

        const text = await response.text();
        console.log('[CSVLoader] CSV file loaded, length:', text.length);

        if (cancelled) {
          console.log('[CSVLoader] Load cancelled');
          return;
        }

        // Parse CSV
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (cancelled) {
              console.log('[CSVLoader] Parse cancelled');
              return;
            }
            
            console.log('[CSVLoader] CSV parsing complete. Raw rows:', results.data.length);
            
            if (results.errors.length > 0) {
              console.warn('[CSVLoader] CSV parsing warnings:', results.errors);
            }

            // Process data: convert to appropriate types and filter empty rows
            const processedData = results.data
              .filter(row => {
                // Filter out completely empty rows
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

            console.log('[CSVLoader] Processed data sample (first row):', processedData[0]);
            console.log('[CSVLoader] Total processed rows:', processedData.length);
            
            // Call callback with processed data
            if (onDataLoadedRef.current) {
              console.log('[CSVLoader] Calling onDataLoaded with', processedData.length, 'rows');
              onDataLoadedRef.current(processedData);
            } else {
              console.warn('[CSVLoader] onDataLoaded callback is not set!');
            }
          },
          error: (error) => {
            if (cancelled) return;
            console.error('[CSVLoader] CSV parsing error:', error);
            if (onErrorRef.current) {
              onErrorRef.current(error);
            }
          }
        });
      } catch (err) {
        if (cancelled) return;
        console.error('[CSVLoader] Error loading CSV:', err);
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }
      }
    };

    loadCSV();
    
    // Cleanup
    return () => {
      cancelled = true;
    };
  }, [csvPath]); // Only depend on csvPath

  return null;
}

export default CSVLoader;

