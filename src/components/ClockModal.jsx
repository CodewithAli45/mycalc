import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

export default function ClockModal({ isOpen, onClose }) {
  const [times, setTimes] = useState({
    ist: new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }),
    gmt: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }),
    est: new Date().toLocaleTimeString('en-GB', { timeZone: 'America/New_York' }),
    pst: new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles' }),
  });

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimes({
        ist: new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }),
        gmt: new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }),
        est: new Date().toLocaleTimeString('en-GB', { timeZone: 'America/New_York' }),
        pst: new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles' }),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatStopwatch = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setStopwatchTime(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="World Clock & Stopwatch">
      <div className="clock-modal-content">
        <div className="world-times">
          <div className="time-row">
            <span className="label">IST (India)</span>
            <span className="value">{times.ist}</span>
          </div>
          <div className="time-row">
            <span className="label">GMT (UTC)</span>
            <span className="value">{times.gmt}</span>
          </div>
          <div className="time-row">
            <span className="label">EST (New York)</span>
            <span className="value">{times.est}</span>
          </div>
          <div className="time-row">
            <span className="label">PST (Los Angeles)</span>
            <span className="value">{times.pst}</span>
          </div>
        </div>

        <div className="stopwatch">
          <h3>Stopwatch</h3>
          <div className="time-display">{formatStopwatch(stopwatchTime)}</div>
          <div className="controls">
            {!isRunning ? (
              <button className="start" onClick={() => setIsRunning(true)}>Start</button>
            ) : (
              <button className="pause" onClick={() => setIsRunning(false)}>Pause</button>
            )}
            <button className="reset" onClick={resetStopwatch}>Reset</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
