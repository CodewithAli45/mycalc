import React from 'react';
import Modal from './Modal';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function CalendarModal({ isOpen, onClose }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calendar">
      <div className="calendar-modal-content">
        <div className="calendar-header">
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&lt;</button>
          <span>{format(currentDate, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="day-name">{day}</div>
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              className={`day ${!isSameMonth(day, monthStart) ? 'not-current-month' : ''} ${
                isSameDay(day, new Date()) ? 'today' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
