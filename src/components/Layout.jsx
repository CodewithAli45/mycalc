import { useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import '../styles/main.scss';

export default function Layout({ children, activeCalculator, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;

    // Detection thresholds
    const minDistance = 50;
    const maxTime = 300;
    const maxVerticalRatio = 0.5; // Swipe must be more horizontal than vertical

    if (deltaTime < maxTime && Math.abs(deltaX) > minDistance && Math.abs(deltaY) / Math.abs(deltaX) < maxVerticalRatio) {
      if (deltaX > 0) {
        // Swipe Right - Open if started near left edge
        if (touchStartRef.current.x < 40 && !isMenuOpen) {
          setIsMenuOpen(true);
        }
      } else {
        // Swipe Left - Close if open
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    }

    touchStartRef.current = null;
  };

  return (
    <div 
      className="layout"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        activePage={activeCalculator} 
        onSelectPage={onNavigate}
      />
      
      <Header 
        activeCalculator={activeCalculator.replace(/([A-Z])/g, ' $1').trim()} // Regex to add space before caps
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} 
      />
      
      <main className="main-content">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
