import React, { useState, useEffect } from 'react';
import { evaluateExpression } from '../utils/calculatorEngine';
import '../styles/scientific-calculator.scss';

export default function ScientificCalc() {
  const [input, setInput] = useState('0');
  const [liveResult, setLiveResult] = useState('');
  const [isDeg, setIsDeg] = useState(true);
  const [ans, setAns] = useState('0');
  const [isCalculated, setIsCalculated] = useState(false);

  const formatResult = (res) => {
    if (res === '' || res === null || res === undefined || res === 'Error') return '';
    const num = parseFloat(res);
    if (isNaN(num)) return '';
    
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  useEffect(() => {
    if (input === '0') {
      setLiveResult('');
      return;
    }

    try {
      const hasOperator = /[+\-*/%^]/.test(input) || /(sin|cos|tan|log|ln|sqrt|exp|mod)/.test(input);
      
      if (!hasOperator) {
        setLiveResult('');
        return;
      }

      let expr = input
        .replace(/π/g, 'pi')
        .replace(/ANS/g, ans)
        .replace(/sin\(/g, isDeg ? 'sin(1deg * ' : 'sin(')
        .replace(/cos\(/g, isDeg ? 'cos(1deg * ' : 'cos(')
        .replace(/tan\(/g, isDeg ? 'tan(1deg * ' : 'tan(');

      const res = evaluateExpression(expr);
      if (res !== 'Error' && res !== undefined && res.toString() !== input) {
        setLiveResult(res.toString());
      } else {
        setLiveResult('');
      }
    } catch {
      setLiveResult('');
    }
  }, [input, isDeg, ans]);

  const handlePress = (val) => {
    if (val === 'AC') {
      setInput('0');
      setLiveResult('');
      setIsCalculated(false);
    } else if (val === 'DEL') {
      setInput(input.length > 1 ? input.slice(0, -1) : '0');
      setIsCalculated(false);
    } else if (val === '=') {
      if (liveResult && liveResult !== 'Error') {
        setAns(liveResult);
        setIsCalculated(true);
      }
    } else if (val === 'Deg/Rad') {
      setIsDeg(!isDeg);
    } else {
      let newVal = input;
      if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'exp'].includes(val)) {
        newVal = (input === '0' || isCalculated) ? val + '(' : input + val + '(';
      } else if (val === 'e') {
        newVal = (input === '0' || isCalculated) ? 'e' : input + 'e';
      } else if (val === 'mod') {
        newVal = input + ' mod ';
      } else if (val === 'x²') {
        newVal = input + '^2';
      } else if (val === 'x^y') {
        newVal = input + '^';
      } else if (val === 'ANS') {
        newVal = (input === '0' || isCalculated) ? 'ANS' : input + 'ANS';
      } else {
        if (input === '0' || isCalculated) {
          if (val === '.') newVal = '0.';
          else newVal = val;
        } else {
          newVal = input + val;
        }
      }
      setInput(newVal);
      setIsCalculated(false);
    }
  };

  const keys = [
    'Deg/Rad', 'sin', 'cos', 'tan', 'log',
    'ln', 'e', 'x²', 'x^y', 'sqrt',
    '(', ')', '%', 'exp', 'mod',
    '7', '8', '9', 'DEL', 'AC',
    '4', '5', '6', '*', '/',
    '1', '2', '3', '+', '-',
    '0', '.', 'π', 'ANS', '='
  ];

  return (
    <div className="calculator-wrapper scientific">
      <div className="display-screen">
        <div className="status-row">
          <div className={`mode-badge ${isDeg ? 'deg' : 'rad'}`}>
            {isDeg ? 'DEG' : 'RAD'}
          </div>
          <div className="ans-preview">ANS: {formatResult(ans)}</div>
        </div>
        <div className="expression-row">
          {input}
        </div>
        <div className={`result-row ${isCalculated ? 'final' : 'live'}`}>
          {formatResult(isCalculated ? ans : liveResult)}
        </div>
      </div>
      <div className="keypad scientific-grid">
        {keys.map((key, index) => (
          <button 
            key={`${key}-${index}`} 
            className={`key ${key === 'Deg/Rad' ? (isDeg ? 'deg-active' : 'rad-active') : ''} ${key === '=' ? 'key-equals' : ''} ${['DEL', 'AC'].includes(key) ? 'key-action' : ''}`}
            onClick={() => handlePress(key)}
          >
            {key === 'Deg/Rad' ? (isDeg ? 'DEG' : 'RAD') : key}
          </button>
        ))}
      </div>
    </div>
  );
}
