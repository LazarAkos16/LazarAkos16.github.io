import React from 'react';
import './App.css';
import { useCSVData } from './hooks/useCSVData';
import SimpleChart from './components/SimpleChart';

function App() {
  // Load CSV data once and use it for all three visualizations
  const { data, loading, error } = useCSVData('/Australian Vehicle Prices.csv');

  return (
    <div className="App">
      <header className="app-header">
        <h1>Australian Vehicle Prices - Data Visualizations</h1>
      </header>
      <main className="main-content">
        <section className="viz-section">
          <h2>Average Price by Brand (Top 10)</h2>
          <div className="viz-container">
            {error ? (
              <div style={{ color: 'red' }}>Error: {error}</div>
            ) : loading ? (
              <div>Loading data...</div>
            ) : data.length > 0 ? (
              <SimpleChart data={data} chartType="bar" />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </section>
        <section className="viz-section">
          <h2>Average Price by Year</h2>
          <div className="viz-container">
            {error ? (
              <div style={{ color: 'red' }}>Error: {error}</div>
            ) : loading ? (
              <div>Loading data...</div>
            ) : data.length > 0 ? (
              <SimpleChart data={data} chartType="line" />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </section>
        <section className="viz-section">
          <h2>Vehicle Distribution by Body Type</h2>
          <div className="viz-container">
            {error ? (
              <div style={{ color: 'red' }}>Error: {error}</div>
            ) : loading ? (
              <div>Loading data...</div>
            ) : data.length > 0 ? (
              <SimpleChart data={data} chartType="pie" />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </section>
        <section className="viz-section">
          <h2>Number of Vehicles Sold per Brand</h2>
          <div className="viz-container">
            {error ? (
              <div style={{ color: 'red' }}>Error: {error}</div>
            ) : loading ? (
              <div>Loading data...</div>
            ) : data.length > 0 ? (
              <SimpleChart data={data} chartType="sales" />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
