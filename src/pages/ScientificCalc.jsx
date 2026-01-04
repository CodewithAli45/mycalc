import React, { useState } from 'react';
import { evaluateExpression, scientificFunctions } from '../utils/calculatorEngine';
import '../styles/scientific-calculator.scss';

export default function ScientificCalc() {
  const [input, setInput] = useState('0');
  const [result, setResult] = useState('');


  const handlePress = (val) => {
    if (val === 'AC') {
      setInput('0');
      setResult('');
    } else if (val === 'DEL') {
      setInput(input.slice(0, -1) || '0');
    } else if (val === '=') {
      const res = evaluateExpression(input);
      setResult(res.toString());
    } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(val)) {
      // For now, just append function name. Logic would need parsing.
      // Simplified: Apply to current input if it's a number
      if (!isNaN(input)) {
        const res = scientificFunctions[val](parseFloat(input));
        setResult(res.toString());
        setInput(res.toString());
      } else {
        setInput(input + val + '(');
      }
    } else {
      if (input === '0') setInput(val);
      else setInput(input + val);
    }
  };

  const keys = [
    '(', ')', 'mc', 'm+', 'm-', 'mr',
    '2nd', 'x²', 'x³', 'x^y', 'e^x', '10^x',
    '1/x', 'sqrt', 'cbrt', 'ln', 'log', 'e',
    'sin', 'cos', 'tan', 'DEG', 'RAD', 'DEL', 'AC',
    '7', '8', '9', '(', ')', '%',
    '4', '5', '6', 'x', '÷',
    '1', '2', '3', '+', '-',
    '0', '.', '=', 'ANS'
  ];

  return (
    <div className="calculator-wrapper scientific">
      <div className="display-screen">
        <div className="history">{result ? `ANS: ${result}` : ''}</div>
        <div className="current-input">{input}</div>
      </div>
      <div className="keypad scientific-grid">
        {keys.map((key, index) => (
          <button 
            key={`${key}-${index}`} 
            className={`key`}
            onClick={() => handlePress(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
