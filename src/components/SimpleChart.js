import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * SimpleChart - Visualization component for Australian Vehicle Prices data
 * Shows different chart types based on CSV data
 */
function SimpleChart({ data, chartType = 'bar' }) {
  if (!data || data.length === 0) {
    return <div>No data to display</div>;
  }

  // Helper function to parse price (remove commas, convert to number)
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleaned = String(priceStr).replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Prepare data based on chart type
  let chartData = [];

  if (chartType === 'bar') {
    // Bar chart: Average price by Brand (top 10 brands)
    const brandStats = {};
    
    data.forEach(row => {
      const brand = row.Brand || 'Unknown';
      const price = parsePrice(row.Price);
      
      if (!brandStats[brand]) {
        brandStats[brand] = { total: 0, count: 0 };
      }
      if (price > 0) {
        brandStats[brand].total += price;
        brandStats[brand].count += 1;
      }
    });

    chartData = Object.entries(brandStats)
      .map(([brand, stats]) => ({
        name: brand,
        value: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
        count: stats.count
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 brands

  } else if (chartType === 'line') {
    // Line chart: Average price by Year
    const yearStats = {};
    
    data.forEach(row => {
      const year = row.Year || 'Unknown';
      const price = parsePrice(row.Price);
      
      if (!yearStats[year]) {
        yearStats[year] = { total: 0, count: 0 };
      }
      if (price > 0 && year !== 'Unknown') {
        yearStats[year].total += price;
        yearStats[year].count += 1;
      }
    });

    chartData = Object.entries(yearStats)
      .map(([year, stats]) => ({
        name: String(year),
        value: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
        count: stats.count
      }))
      .filter(item => item.value > 0 && item.name !== 'Unknown')
      .sort((a, b) => a.name.localeCompare(b.name));

  } else if (chartType === 'pie') {
    // Pie chart: Distribution by Body Type
    const bodyTypeCounts = {};
    
    data.forEach(row => {
      const bodyType = row.BodyType || row['Car/Suv'] || 'Unknown';
      if (bodyType && bodyType.trim() !== '' && bodyType !== '-') {
        bodyTypeCounts[bodyType] = (bodyTypeCounts[bodyType] || 0) + 1;
      }
    });

    chartData = Object.entries(bodyTypeCounts)
      .map(([bodyType, count]) => ({
        name: bodyType,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 body types
  }

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82CA9D', '#FFC658', '#FF7C7C'];

  if (chartData.length === 0) {
    return <div>No data available for this chart type</div>;
  }

  // Custom tooltip formatter
  const formatPrice = (value) => {
    return `$${value.toLocaleString()}`;
  };

  switch (chartType) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={formatPrice}
            />
            <Tooltip 
              formatter={(value) => formatPrice(value)}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Average Price"
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              tickFormatter={formatPrice}
            />
            <Tooltip 
              formatter={(value, name, props) => [
                formatPrice(value),
                'Average Price',
                `Count: ${props.payload.count} vehicles`
              ]}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#8884d8"
              name="Average Price (AUD)"
            />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                // Show name and percentage, but only if percentage is significant
                if (percent < 0.05) return '';
                return `${name}: ${(percent * 100).toFixed(1)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} vehicles`, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return <div>Unknown chart type: {chartType}</div>;
  }
}

export default SimpleChart;

