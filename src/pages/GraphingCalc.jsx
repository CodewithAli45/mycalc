import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { evaluateExpression } from '../utils/calculatorEngine';
import '../styles/graphing-calculator.scss';

export default function GraphingCalc() {
  const [func, setFunc] = useState('x * x'); // default y = x^2
  const [data, setData] = useState([]);

  const generateGraph = () => {
    const newData = [];
    for (let x = -10; x <= 10; x += 1) {
      // Very risky eval, assume sanitized or use mathjs evaluate
      // Replacing 'x' with value
      try {
        const expression = func.replace(/x/g, `(${x})`);
        const y = evaluateExpression(expression); // Reuse our engine
        newData.push({ x, y: parseFloat(y) });
      } catch {
        // error
      }
    }
    setData(newData);
  };

  // Generate initial on mount
  React.useEffect(() => {
    generateGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="calculator-wrapper graphing">
      <div className="input-area">
        <label>f(x) = </label>
        <input 
          type="text" 
          value={func} 
          onChange={(e) => setFunc(e.target.value)} 
          placeholder="e.g. x * x or sin(x)"
        />
        <button onClick={generateGraph}>Plot</button>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
