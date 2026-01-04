import React, { useState } from 'react';
import '../styles/basic-calculator.scss';
import { evaluateExpression } from '../utils/calculatorEngine';

export default function BasicCalc() {
  const [input, setInput] = useState('0');
  const [ansValue, setAnsValue] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const handlePress = (val) => {
    if (val === 'AC') {
      setInput('0');
      setIsCalculated(false);
    } else if (val === 'DEL') {
      if (isCalculated) {
        setInput('0');
        setIsCalculated(false);
      } else {
        setInput(input.length > 1 ? input.slice(0, -1) : '0');
      }
    } else if (val === '=') {
      const result = evaluateExpression(input, { ANS: ansValue });
      if (result !== 'Error') {
        setAnsValue(result);
        setInput(result.toString());
        setIsCalculated(true);
      } else {
        setInput('Error');
        setIsCalculated(true);
      }
    } else if (val === 'ANS') {
      if (isCalculated || input === '0') {
        setInput('ANS');
      } else {
        setInput(input + 'ANS');
      }
      setIsCalculated(false);
    } else {
      if (isCalculated || input === '0') {
        setInput(val);
      } else {
        setInput(input + val);
      }
      setIsCalculated(false);
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
        <div className="ans-display">Ans: {ansValue}</div>
        <div className={`expression-display ${isCalculated ? 'calculated' : ''}`}>
          {input}
        </div>
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
