import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Header({ activeCalculator, onToggleMenu }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header">
      <button className="menu-btn" onClick={onToggleMenu} aria-label="Menu">
        <Menu size={28} color="white" />
      </button>
      <h1>{activeCalculator}</h1>
      <div className="clock" style={{ minWidth: '80px', textAlign: 'right' }}>
        {time}
      </div>
    </header>
  );
}
