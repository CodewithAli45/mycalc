import React, { useState } from 'react';
import '../styles/basic-calculator.scss';

export default function BasicCalc() {
  const [input, setInput] = useState('0');
  const [result, setResult] = useState('');

  // Placeholder logic
  const handlePress = (val) => {
    // Basic logic
    if (val === 'AC') {
      setInput('0');
      setResult('');
    } else if (val === '=') {
      try {
        setResult(eval(input.replace('x', '*').replace('÷', '/'))); // Basic eval for now
      } catch {
        setResult('Error');
      }
    } else {
      if (input === '0') setInput(val);
      else setInput(input + val);
    }
  };

  const keys = [
    '√', '(', ')', 'DEL', 'AC',
    '7', '8', '9', '%', '÷',
    '4', '5', '6', '-', 'x',
    '1', '2', '3', '+',
    '0', '.', 'ANS', '=' 
  ];

  return (
    <div className="calculator-wrapper">
      <div className="display-screen">
        <div className="history">{result ? `ANS: ${result}` : ''}</div>
        <div className="current-input">{input}</div>
      </div>
      <div className="keypad">
        {keys.map((key) => (
          <button 
            key={key} 
            className={`key ${['DEL', 'AC'].includes(key) ? 'key-action' : ''} ${['x', '÷', '-', '+'].includes(key) ? 'key-operator' : ''} ${key === '=' ? 'key-equals' : ''} ${key === '+' ? 'key-plus' : ''}`}
            onClick={() => handlePress(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
