# CSV Data Visualization Guide

## Overview
There are several ways to use CSV files for data visualization in React:

## Method 1: Static CSV File in Public Folder
**Best for:** Pre-defined datasets that don't change frequently

### Steps:
1. Place your CSV file in the `public` folder
2. Fetch it using the Fetch API or axios
3. Parse it using a CSV parser library
4. Use the parsed data in your visualization

### Example:
```javascript
// Load CSV from public folder
const loadCSV = async () => {
  const response = await fetch('/data.csv');
  const text = await response.text();
  // Parse CSV text into JavaScript objects
};
```

## Method 2: File Upload
**Best for:** Letting users upload their own CSV files

### Steps:
1. Create a file input element
2. Read the file using FileReader API
3. Parse the CSV content
4. Update your visualization with the new data

## Method 3: External URL/API
**Best for:** Data from external sources or APIs

### Steps:
1. Fetch CSV from URL
2. Parse the response
3. Use in visualization

## CSV Parsing Libraries

### 1. PapaParse (Recommended)
- Most popular and feature-rich
- Handles edge cases well
- Supports streaming for large files
- Install: `npm install papaparse`

### 2. D3-dsv
- Part of D3.js ecosystem
- Lightweight
- Install: `npm install d3-dsv`

### 3. Manual Parsing
- Only for simple CSV files
- Not recommended for production

## Visualization Libraries

### 1. Recharts
- Built for React
- Easy to use
- Good documentation
- Install: `npm install recharts`

### 2. Chart.js with react-chartjs-2
- Very popular
- Many chart types
- Install: `npm install chart.js react-chartjs-2`

### 3. D3.js
- Most powerful and flexible
- Steeper learning curve
- Install: `npm install d3`

### 4. Plotly.js
- Interactive charts
- Scientific visualization
- Install: `npm install plotly.js react-plotly.js`

## Example Workflow

1. **Install dependencies:**
   ```bash
   npm install papaparse recharts
   ```

2. **Load CSV data:**
   ```javascript
   import Papa from 'papaparse';
   
   const [data, setData] = useState([]);
   
   useEffect(() => {
     fetch('/data.csv')
       .then(response => response.text())
       .then(text => {
         Papa.parse(text, {
           header: true,
           complete: (results) => {
             setData(results.data);
           }
         });
       });
   }, []);
   ```

3. **Visualize data:**
   ```javascript
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
   
   <LineChart data={data}>
     <CartesianGrid strokeDasharray="3 3" />
     <XAxis dataKey="date" />
     <YAxis />
     <Tooltip />
     <Legend />
     <Line type="monotone" dataKey="value" stroke="#8884d8" />
   </LineChart>
   ```

## CSV File Format
Your CSV should have a header row with column names:
```csv
name,value,date
Item 1,100,2024-01-01
Item 2,200,2024-01-02
Item 3,150,2024-01-03
```

The parser will convert this into:
```javascript
[
  { name: "Item 1", value: "100", date: "2024-01-01" },
  { name: "Item 2", value: "200", date: "2024-01-02" },
  { name: "Item 3", value: "150", date: "2024-01-03" }
]
```

**Note:** CSV values are always strings, so you may need to convert numbers:
```javascript
data.map(row => ({
  ...row,
  value: parseFloat(row.value) || 0
}))
```

