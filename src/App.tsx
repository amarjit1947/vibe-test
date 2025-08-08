import React, { useState } from 'react';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const parseCSV = (text: string): any[] => {
  const lines = text.split('\n').filter(Boolean);
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, idx) => {
      obj[header.trim()] = values[idx]?.trim();
      return obj;
    }, {} as Record<string, string>);
  });
};

const getNumericColumns = (data: any[]): string[] => {
  if (!data || data.length === 0) return [];
  const sample = data[0];
  return Object.keys(sample).filter(key => !isNaN(Number(sample[key])));
};

const getSummaryStats = (data: any[], numericCols: string[]) => {
  const stats: Record<string, { min: number; max: number; mean: number }> = {};
  numericCols.forEach(col => {
    const nums = data.map(row => Number(row[col])).filter(n => !isNaN(n));
    if (nums.length) {
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      stats[col] = { min, max, mean: Number(mean.toFixed(2)) };
    }
  });
  return stats;
};

function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (file.name.endsWith('.json')) {
          setData(JSON.parse(event.target?.result as string));
        } else if (file.name.endsWith('.csv')) {
          setData(parseCSV(event.target?.result as string));
        } else {
          setError('Unsupported file type. Please upload a CSV or JSON file.');
        }
        setError(null);
      } catch (err) {
        setError('Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  let numericCols: string[] = [];
  let summaryStats: Record<string, { min: number; max: number; mean: number }> = {};
  if (data && data.length > 0) {
    numericCols = getNumericColumns(data);
    summaryStats = getSummaryStats(data, numericCols);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Insights App</h1>
        <input type="file" accept=".csv,.json" onChange={handleFileUpload} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data ? (
          <div style={{ maxHeight: 600, overflow: 'auto', marginTop: 20, width: '100%' }}>
            <h2>Uploaded Data Preview</h2>
            <pre style={{ textAlign: 'left', background: '#222', color: '#fff', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(data.slice(0, 5), null, 2)}
            </pre>
            <p>...and {data.length - 5 > 0 ? data.length - 5 : 0} more rows</p>
            <h2>Summary Statistics</h2>
            {numericCols.length > 0 ? (
              <table style={{ margin: '0 auto', background: '#333', color: '#fff', borderRadius: 4 }}>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Mean</th>
                  </tr>
                </thead>
                <tbody>
                  {numericCols.map(col => (
                    <tr key={col}>
                      <td>{col}</td>
                      <td>{summaryStats[col]?.min}</td>
                      <td>{summaryStats[col]?.max}</td>
                      <td>{summaryStats[col]?.mean}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No numeric columns found for summary statistics.</p>
            )}
            <h2>Trends & Charts</h2>
            {numericCols.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={Object.keys(data[0])[0]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {numericCols.map(col => (
                    <Line key={col} type="monotone" dataKey={col} stroke="#8884d8" dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No numeric columns to plot trends.</p>
            )}
          </div>
        ) : (
          <p>Upload a CSV or JSON file to get started.</p>
        )}
      </header>
    </div>
  );
}

export default App;
