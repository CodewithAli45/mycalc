import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import '../styles/main.scss';

export default function Layout({ children, activeCalculator, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="layout">
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
