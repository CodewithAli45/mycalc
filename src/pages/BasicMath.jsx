import React, { useState } from 'react';
import { create, all } from 'mathjs';
import MathTest from '../components/MathTest';
import '../styles/basic-math.scss';

const math = create(all);

export default function BasicMath() {
  const [inputs, setInputs] = useState(['', '']);
  const [result, setResult] = useState('');
  const [operation, setOperation] = useState('GCD');
  const [isTestMode, setIsTestMode] = useState(false);

  const operations = {
    GCD: (vals) => math.gcd(...vals),
    LCM: (vals) => math.lcm(...vals),
    'Prime Factors': (val) => {
      return math.isPrime(val) ? 'Prime' : 'Composite';
    }
  };

  const calculate = () => {
    try {
      const vals = inputs.map(i => parseInt(i) || 0);
      if (operation === 'Prime Factors') {
        const res = operations[operation](vals[0]);
        setResult(res.toString());
      } else {
        const res = operations[operation](vals);
        setResult(res.toString());
      }
    } catch {
      setResult('Error');
    }
  };

  const handleInputChange = (index, val) => {
    const newInputs = [...inputs];
    newInputs[index] = val;
    setInputs(newInputs);
  };

  if (isTestMode) {
    return (
      <div className="calculator-wrapper basic-math">
        <MathTest onCancel={() => setIsTestMode(false)} />
      </div>
    );
  }

  return (
    <div className="calculator-wrapper basic-math">
      <div className="op-buttons">
        <button 
          className={isTestMode ? 'active' : ''}
          onClick={() => setIsTestMode(true)}
        >
          Test
        </button>
        {Object.keys(operations).map(op => (
          <button 
            key={op} 
            className={operation === op ? 'active' : ''}
            onClick={() => setOperation(op)}
          >
            {op}
          </button>
        ))}
      </div>

      <div className="inputs-area">
        {operation === 'Prime Factors' ? (
           <input 
             type="number" 
             placeholder="Enter number"
             value={inputs[0]}
             onChange={(e) => handleInputChange(0, e.target.value)}
           />
        ) : (
          <>
            <input 
              type="number" 
              placeholder="Number 1"
              value={inputs[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Number 2"
              value={inputs[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
            />
          </>
        )}
        <button className="calc-btn" onClick={calculate}>Calculate</button>
      </div>

      <div className="result-area">
        <label>Result</label>
        <div className="val">{result}</div>
      </div>
    </div>
  );
}
