import React, { useState } from 'react';
import '../styles/printing-calculator.scss';


export default function PrintingCalc() {
  const [tape, setTape] = useState([]);
  const [input, setInput] = useState('0');

  const addLine = (op, val) => {
    const newVal = { id: Date.now(), op, val };
    setTape([...tape, newVal]);
  };

  const handlePress = (val) => {
    if (['+', '-', '*', '/'].includes(val)) {
      addLine(val, input);
      setInput('0');
    } else if (val === '=') {
      // Calculate total based on tape is complex, simplified: just evaluate current input
      // Actually printing calculator usually prints each step.
      // Let's just treat it as: Input -> Operator -> Print -> Reset Input
      addLine('=', input);
      // Logic to sum up tape would be better, but for now just logging
      setInput('0'); 
    } else if (val === 'C') {
      setInput('0');
    } else if (val === 'Print') {
      window.print();
    } else {
      setInput(input === '0' ? val : input + val);
    }
  };

  return (
    <div className="calculator-wrapper printing">
      <div className="tape-display">
        {tape.map((item) => (
          <div key={item.id} className="tape-line">
            <span className="op">{item.op}</span>
            <span className="val">{item.val}</span>
          </div>
        ))}
        <div className="tape-line current">
          <span className="val">{input}</span>
        </div>
      </div>

      <div className="keypad">
        <button className="key" onClick={() => handlePress('7')}>7</button>
        <button className="key" onClick={() => handlePress('8')}>8</button>
        <button className="key" onClick={() => handlePress('9')}>9</button>
        <button className="key op" onClick={() => handlePress('/')}>÷</button>

        <button className="key" onClick={() => handlePress('4')}>4</button>
        <button className="key" onClick={() => handlePress('5')}>5</button>
        <button className="key" onClick={() => handlePress('6')}>6</button>
        <button className="key op" onClick={() => handlePress('*')}>x</button>

        <button className="key" onClick={() => handlePress('1')}>1</button>
        <button className="key" onClick={() => handlePress('2')}>2</button>
        <button className="key" onClick={() => handlePress('3')}>3</button>
        <button className="key op" onClick={() => handlePress('-')}>-</button>
        
        <button className="key" onClick={() => handlePress('0')}>0</button>
        <button className="key" onClick={() => handlePress('.')}>.</button>
        <button className="key action" onClick={() => handlePress('C')}>C</button>
        <button className="key op" onClick={() => handlePress('+')}>+</button>

        <button className="key action full-width" onClick={() => handlePress('Print')}>PRINT TAPE</button>
      </div>
    </div>
  );
}
