import React, { useState } from 'react';

export default function AreaFinder() {
  const [l1, setL1] = useState({ feet: '', inches: '' });
  const [l2, setL2] = useState({ feet: '', inches: '' });
  const [results, setResults] = useState(null);

  const calculate = () => {
    const f1 = parseFloat(l1.feet) || 0;
    const i1 = parseFloat(l1.inches) || 0;
    const f2 = parseFloat(l2.feet) || 0;
    const i2 = parseFloat(l2.inches) || 0;

    const totalInches1 = (f1 * 12) + i1;
    const totalInches2 = (f2 * 12) + i2;

    const areaSqIn = totalInches1 * totalInches2;
    const areaSqFt = areaSqIn / 144;

    setResults({
      sqIn: areaSqIn.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      sqFt: areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 4 })
    });
  };

  return (
    <div className="area-finder-container">
      <div className="input-rows">
        <div className="input-row">
          <label>Length 1</label>
          <div className="fields">
            <div className="field">
              <input 
                type="number" 
                placeholder="ft" 
                value={l1.feet} 
                onChange={(e) => setL1({ ...l1, feet: e.target.value })}
              />
              <span>ft</span>
            </div>
            <div className="field">
              <input 
                type="number" 
                placeholder="in" 
                value={l1.inches} 
                onChange={(e) => setL1({ ...l1, inches: e.target.value })}
              />
              <span>in</span>
            </div>
          </div>
        </div>

        <div className="input-row">
          <label>Length 2</label>
          <div className="fields">
            <div className="field">
              <input 
                type="number" 
                placeholder="ft" 
                value={l2.feet} 
                onChange={(e) => setL2({ ...l2, feet: e.target.value })}
              />
              <span>ft</span>
            </div>
            <div className="field">
              <input 
                type="number" 
                placeholder="in" 
                value={l2.inches} 
                onChange={(e) => setL2({ ...l2, inches: e.target.value })}
              />
              <span>in</span>
            </div>
          </div>
        </div>
      </div>

      <button className="calculate-btn" onClick={calculate}>Calculate Area</button>

      {results && (
        <div className="results-area">
          <div className="result-item">
            <label>Area in Square Feet</label>
            <div className="value">{results.sqFt} sq.ft</div>
          </div>
          <div className="result-item">
            <label>Area in Square Inches</label>
            <div className="value">{results.sqIn} sq.in</div>
          </div>
        </div>
      )}
    </div>
  );
}
