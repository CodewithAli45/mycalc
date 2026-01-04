import React, { useState } from 'react';
import '../styles/programmer-calculator.scss';

export default function ProgrammerCalc() {
  const [input, setInput] = useState('0');
  const [radix, setRadix] = useState(10); // 10, 16, 8, 2

  const updateInput = (val) => {
    if (input === '0') setInput(val);
    else setInput(input + val);
  };

  const handleRadixChange = (newRadix) => {
    // Convert current input to new radix
    const decimalValue = parseInt(input, radix);
    if (!isNaN(decimalValue)) {
      setInput(decimalValue.toString(newRadix).toUpperCase());
      setRadix(newRadix);
    }
  };

  const getDisplayValues = () => {
    const dec = parseInt(input, radix);
    if (isNaN(dec)) return { hex: '0', dec: '0', oct: '0', bin: '0' };
    return {
      hex: dec.toString(16).toUpperCase(),
      dec: dec.toString(10),
      oct: dec.toString(8),
      bin: dec.toString(2)
    };
  };

  const displays = getDisplayValues();

  return (
    <div className="calculator-wrapper programmer">
      <div className="radix-displays">
        <div className={`radix-row ${radix === 16 ? 'active' : ''}`} onClick={() => handleRadixChange(16)}>
          <span>HEX</span> <span>{displays.hex}</span>
        </div>
        <div className={`radix-row ${radix === 10 ? 'active' : ''}`} onClick={() => handleRadixChange(10)}>
          <span>DEC</span> <span>{displays.dec}</span>
        </div>
        <div className={`radix-row ${radix === 8 ? 'active' : ''}`} onClick={() => handleRadixChange(8)}>
          <span>OCT</span> <span>{displays.oct}</span>
        </div>
        <div className={`radix-row ${radix === 2 ? 'active' : ''}`} onClick={() => handleRadixChange(2)}>
          <span>BIN</span> <span>{displays.bin}</span>
        </div>
      </div>
      
      <div className="current-input-large">
        {input}
      </div>

      <div className="keypad programmer-grid">
        {['A', 'B', 'C', 'D', 'E', 'F'].map(char => (
          <button 
            key={char} 
            className="key" 
            disabled={radix < 16 && radix !== 16} // Simplified logic: only HEX needs A-F
            onClick={() => updateInput(char)}
          >
            {char}
          </button>
        ))}
        {/* Standard Numpad + Bitwise ops placeholder */}
        <button className="key" onClick={() => setInput('0')}>AC</button>
        <button className="key" onClick={() => setInput(input.slice(0, -1) || '0')}>DEL</button>
        
        {[7,8,9, 4,5,6, 1,2,3, 0].map(num => (
          <button 
            key={num} 
            className="key" 
            disabled={radix === 2 && num > 1 || radix === 8 && num > 7}
            onClick={() => updateInput(num.toString())}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
