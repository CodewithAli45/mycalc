import React, { useState } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import '../styles/date-calculator.scss';

export default function DateCalc() {
  const [mode, setMode] = useState('diff'); // 'diff' or 'add'
  const [date1, setDate1] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [date2, setDate2] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [daysToAdd, setDaysToAdd] = useState(0);

  const calculate = () => {
    if (mode === 'diff') {
      const diff = differenceInDays(new Date(date2), new Date(date1));
      return `${Math.abs(diff)} Days`;
    } else {
      const res = addDays(new Date(date1), parseInt(daysToAdd) || 0);
      return format(res, 'MMM dd, yyyy');
    }
  };

  return (
    <div className="calculator-wrapper date-calc">
      <div className="mode-toggle">
        <button className={mode === 'diff' ? 'active' : ''} onClick={() => setMode('diff')}>Difference</button>
        <button className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>Add/Sub Days</button>
      </div>

      <div className="inputs">
        <div className="input-group">
          <label>Start Date</label>
          <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
        </div>

        {mode === 'diff' ? (
          <div className="input-group">
            <label>End Date</label>
            <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
          </div>
        ) : (
          <div className="input-group">
            <label>Days to Add/Subtract</label>
            <input type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(e.target.value)} />
          </div>
        )}
      </div>

      <div className="result-area">
        <h3>Result</h3>
        <div className="result-value">{calculate()}</div>
      </div>
    </div>
  );
}
