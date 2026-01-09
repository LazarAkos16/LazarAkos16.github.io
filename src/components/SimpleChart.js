import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Sector,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const RADIAN = Math.PI / 180;

const renderActiveSlice = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    midAngle,
    payload
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 25) * cos;
  const my = cy + (outerRadius + 25) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 25;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 20}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {payload.name}
      </text>
    </g>
  );
};

/**
 * SimpleChart - Visualization component for Australian Vehicle Prices data
 * Shows different chart types based on CSV data
 */
function SimpleChart({ data, chartType = 'bar' }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const handlePieClick = (_, index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };
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

  } else if (chartType === 'sales') {
    // Bar chart: Number of vehicles sold per Brand
    const brandCounts = {};
    
    data.forEach(row => {
      const brand = row.Brand || 'Unknown';
      if (brand && brand.trim() !== '' && brand !== 'Unknown') {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });

    chartData = Object.entries(brandCounts)
      .map(([brand, count]) => ({
        name: brand,
        value: count
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 brands by sales count
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
        <ResponsiveContainer width="100%" height={500}>
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
        <ResponsiveContainer width="100%" height={500}>
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
          <ResponsiveContainer width="100%" height={500}>
            <PieChart margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                label={({ name, percent }) => {
                  if (percent < 0.01) return '';
                  return `${name}: ${(percent * 100).toFixed(1)}%`;
                }}
                labelLine={{ stroke: '#666', strokeWidth: 1 }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'sales':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} vehicles`, 'Number of Vehicles']}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#00C49F"
                name="Number of Vehicles"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
    default:
      return <div>Unknown chart type: {chartType}</div>;
  }
}

export default SimpleChart;

