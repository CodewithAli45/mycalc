import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../styles/financial-calculator.scss';

export default function FinancialCalc() {
  const [activeTab, setActiveTab] = useState('loan'); // 'loan' or 'investment'
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState(null);

  const formatINR = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const calculate = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 100;
    const T = parseFloat(time);

    if (isNaN(P) || isNaN(R) || isNaN(T)) return;

    if (activeTab === 'loan') {
      const r = R / 12;
      const n = T * 12;
      const emi = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPaid = emi * n;
      const totalInterest = totalPaid - P;
      
      setResult({
        emi: emi,
        principal: P,
        interest: totalInterest,
        total: totalPaid,
        chartData: [
          { name: 'Principal', value: P },
          { name: 'Interest', value: totalInterest }
        ]
      });
    } else {
      // Compound Interest (Annual)
      const totalAmount = P * Math.pow(1 + R, T);
      const interestEarned = totalAmount - P;
      
      setResult({
        principal: P,
        interest: interestEarned,
        total: totalAmount,
        chartData: [
          { name: 'Principal', value: P },
          { name: 'Interest', value: interestEarned }
        ]
      });
    }
  };

  const COLORS = ['#48bb78', '#f56565'];

  return (
    <div className="calculator-wrapper financial">
      <div className="tabs">
        <button className={activeTab === 'loan' ? 'active' : ''} onClick={() => {setActiveTab('loan'); setResult(null);}}>Loan</button>
        <button className={activeTab === 'investment' ? 'active' : ''} onClick={() => {setActiveTab('investment'); setResult(null);}}>Investment</button>
      </div>

      <div className="inputs">
        <div className="input-group">
          <label>Principal Amount (₹)</label>
          <input type="number" placeholder="Enter amount" value={principal} onChange={e => setPrincipal(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Interest Rate (% p.a)</label>
          <input type="number" placeholder="Enter rate" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Time (Years)</label>
          <input type="number" placeholder="Enter years" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        
        <button className="calc-btn" onClick={calculate}>Calculate</button>
      </div>

      {result && (
        <div className="result-area">
          <div className="result-details">
            {result.emi && (
              <div className="res-row">
                <span className="label">Monthly EMI</span>
                <span className="val">{formatINR(result.emi)}</span>
              </div>
            )}
            <div className="res-row">
              <span className="label">Principal Amount</span>
              <span className="val">{formatINR(result.principal)}</span>
            </div>
            <div className="res-row">
              <span className="label">{activeTab === 'loan' ? 'Total Interest' : 'Interest Earned'}</span>
              <span className="val danger">{formatINR(result.interest)}</span>
            </div>
            <div className="res-row">
              <span className="label">Total Amount</span>
              <span className="val">{formatINR(result.total)}</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={result.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {result.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatINR(value)}
                  contentStyle={{ backgroundColor: '#1a202c', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
