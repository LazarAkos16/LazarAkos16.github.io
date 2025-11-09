# How to Use CSV Files for Data Visualization

## Quick Start

Your app is now set up to load and visualize CSV data! Here's how it works:

## 1. **Place Your CSV File in the Public Folder**

Put your CSV file in the `public` folder (e.g., `public/my-data.csv`)

**CSV Format Example:**
```csv
name,value,date,category
Product A,120,2024-01-01,Electronics
Product B,85,2024-01-02,Clothing
Product C,200,2024-01-03,Electronics
```

**Important:** 
- First row must contain column headers
- Values in the same column should be the same type (numbers, dates, text)

## 2. **Load CSV Data in Your Component**

```javascript
import CSVLoader from './components/CSVLoader';
import { useState } from 'react';

function MyComponent() {
  const [data, setData] = useState([]);

  return (
    <>
      <CSVLoader 
        csvPath="/my-data.csv"  // Path to your CSV file
        onDataLoaded={(parsedData) => {
          // This callback receives the parsed data
          setData(parsedData);
        }}
        onError={(error) => {
          console.error('Error:', error);
        }}
      />
      
      {/* Use the data in your visualization */}
      {data.length > 0 && (
        <SimpleChart data={data} chartType="bar" />
      )}
    </>
  );
}
```

## 3. **Visualize the Data**

```javascript
import SimpleChart from './components/SimpleChart';

// Available chart types: 'bar', 'line', 'pie'
<SimpleChart data={data} chartType="bar" />
```

## How It Works

### Step 1: Fetch CSV File
```javascript
const response = await fetch('/sample-data.csv');
const text = await response.text();
```

### Step 2: Parse CSV with PapaParse
```javascript
Papa.parse(text, {
  header: true,        // Use first row as column names
  skipEmptyLines: true,
  complete: (results) => {
    // results.data is an array of objects
    // Each object represents a row
    // Column names become object keys
  }
});
```

### Step 3: Process Data
```javascript
// CSV values are strings, convert to numbers if needed
const processedData = results.data.map(row => ({
  ...row,
  value: parseFloat(row.value) || 0
}));
```

### Step 4: Visualize
```javascript
// Pass processed data to chart component
<SimpleChart data={processedData} chartType="bar" />
```

## Alternative: File Upload

You can also let users upload their own CSV files:

```javascript
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const text = e.target.result;
    Papa.parse(text, {
      header: true,
      complete: (results) => {
        setData(results.data);
      }
    });
  };
  
  reader.readAsText(file);
};

// In your JSX:
<input type="file" accept=".csv" onChange={handleFileUpload} />
```

## Data Structure

After parsing, your CSV:
```csv
name,value
Item 1,100
Item 2,200
```

Becomes:
```javascript
[
  { name: "Item 1", value: "100" },
  { name: "Item 2", value: "200" }
]
```

**Note:** Values are strings by default. The CSVLoader component automatically converts numeric values to numbers.

## Customizing Charts

You can create custom visualizations using the data:

```javascript
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function MyCustomChart({ data }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
}
```

## Tips

1. **Column Names:** Use clear, simple column names (avoid spaces, special characters)
2. **Data Types:** Keep consistent data types in each column
3. **Large Files:** For very large CSV files (>10MB), consider:
   - Server-side processing
   - Streaming parsers
   - Data pagination
4. **Error Handling:** Always handle errors when loading CSV files
5. **Data Validation:** Validate data after parsing (check for missing values, wrong types)

## Example: Multiple Data Sources

```javascript
function App() {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  return (
    <>
      <CSVLoader csvPath="/sales.csv" onDataLoaded={setSalesData} />
      <CSVLoader csvPath="/inventory.csv" onDataLoaded={setInventoryData} />
      
      <SimpleChart data={salesData} chartType="bar" />
      <SimpleChart data={inventoryData} chartType="line" />
    </>
  );
}
```

## Next Steps

- Replace `sample-data.csv` with your own data
- Customize chart types and styles
- Add filters and interactive features
- Combine multiple data sources
- Add data transformation/aggregation


