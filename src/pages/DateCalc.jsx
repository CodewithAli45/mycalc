import React, { useState } from 'react';
import { differenceInDays, addDays, format, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
import '../styles/date-calculator.scss';

export default function DateCalc() {
  const [mode, setMode] = useState('diff'); // 'diff' or 'add'
  const [date1, setDate1] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [date2, setDate2] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [daysToAdd, setDaysToAdd] = useState(0);

  const calculateResults = () => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (mode === 'diff') {
      const days = Math.abs(differenceInDays(d2, d1));
      const weeks = (days / 7).toFixed(1);
      const months = (days / 30.4375).toFixed(1);
      const years = (days / 365.25).toFixed(2);
      
      return { days, weeks, months, years };
    } else {
      const res = addDays(d1, parseInt(daysToAdd) || 0);
      return format(res, 'dd/MM/yyyy (MMM dd)');
    }
  };

  const results = calculateResults();

  return (
    <div className="calculator-wrapper date-calc">
      <div className="mode-toggle">
        <button className={mode === 'diff' ? 'active' : ''} onClick={() => setMode('diff')}>Difference</button>
        <button className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>Add Days</button>
      </div>

      <div className="inputs">
        <div className="input-group">
          <label>Start Date</label>
          <div className="custom-date-wrapper">
            <span className="date-display">
              {format(new Date(date1), 'dd / MM / yyyy')}
            </span>
            <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
          </div>
        </div>

        {mode === 'diff' ? (
          <div className="input-group">
            <label>End Date</label>
            <div className="custom-date-wrapper">
              <span className="date-display">
                {format(new Date(date2), 'dd / MM / yyyy')}
              </span>
              <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="input-group">
            <label>Days to Add</label>
            <input type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(e.target.value)} />
          </div>
        )}
      </div>

      <div className="result-area">
        <h3>Result</h3>
        {mode === 'diff' ? (
          <div className="result-grid">
            <div className="result-item">
              <span className="label">Days</span>
              <span className="value">{results.days}</span>
            </div>
            <div className="result-item">
              <span className="label">Weeks</span>
              <span className="value">{results.weeks}</span>
            </div>
            <div className="result-item">
              <span className="label">Months</span>
              <span className="value">{results.months}</span>
            </div>
            <div className="result-item">
              <span className="label">Years</span>
              <span className="value">{results.years}</span>
            </div>
          </div>
        ) : (
          <div className="result-value">{results}</div>
        )}
      </div>
    </div>
  );
}
