import React, { useState, useEffect } from 'react';
import { Menu, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import ClockModal from './ClockModal';
import CalendarModal from './CalendarModal';

export default function Header({ activeCalculator, onToggleMenu }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-top">
          <span className="calc-name">{activeCalculator}</span>
        </div>
        <div className="header-bottom">
          <div className="header-col left">
            <button className="menu-btn" onClick={onToggleMenu} aria-label="Menu">
              <Menu size={24} color="white" />
            </button>
          </div>
          <div className="header-col center">
            <div 
              className="clock-display" 
              onClick={() => setIsClockModalOpen(true)}
              title="Click for World Clock & Stopwatch"
            >
              <Clock size={16} />
              <span>{time}</span>
            </div>
          </div>
          <div className="header-col right">
            <div 
              className="calendar-display" 
              onClick={() => setIsCalendarModalOpen(true)}
              title="Click for Calendar"
            >
              <span>{format(currentDate, 'dd.MM.yyyy')}</span>
            </div>
          </div>
        </div>
      </header>

      <ClockModal 
        isOpen={isClockModalOpen} 
        onClose={() => setIsClockModalOpen(false)} 
      />
      <CalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
      />
    </>
  );
}
