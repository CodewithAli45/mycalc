import React, { useState } from 'react';
import '../styles/financial-calculator.scss';

export default function FinancialCalc() {
  const [activeTab, setActiveTab] = useState('loan'); // 'loan' or 'investment'
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 100;
    const T = parseFloat(time);

    if (isNaN(P) || isNaN(R) || isNaN(T)) {
      setResult('Invalid Input');
      return;
    }

    if (activeTab === 'loan') {
      // Simple Loan Interest (Amortization is complex, sticking to simple/compound total for now or monthly payment)
      // Monthly Payment Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
      const r = R / 12;
      const n = T * 12;
      const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setResult(`Monthly Payment: $${M.toFixed(2)}\nTotal Paid: $${(M * n).toFixed(2)}`);
    } else {
      // Compound Interest: A = P(1 + r/n)^(nt) -- assume compounded annually for simplicity
      const A = P * Math.pow(1 + R, T);
      setResult(`Total Amount: $${A.toFixed(2)}\nInterest Earned: $${(A - P).toFixed(2)}`);
    }
  };

  return (
    <div className="calculator-wrapper financial">
      <div className="tabs">
        <button className={activeTab === 'loan' ? 'active' : ''} onClick={() => setActiveTab('loan')}>Loan / Mortgage</button>
        <button className={activeTab === 'investment' ? 'active' : ''} onClick={() => setActiveTab('investment')}>Investment</button>
      </div>

      <div className="inputs">
        <div className="input-group">
          <label>Principal Amount ($)</label>
          <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Interest Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Time ({activeTab === 'loan' ? 'Years' : 'Years'})</label>
          <input type="number" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        
        <button className="calc-btn" onClick={calculate}>Calculate</button>
      </div>

      {result && (
        <div className="result-area">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
