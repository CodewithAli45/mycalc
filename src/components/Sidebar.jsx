import { Home, Calculator, Binary, DollarSign, Printer, TrendingUp, Scale, Calendar, Sigma } from 'lucide-react';
import React from 'react';
import '../styles/sidebar.scss';

export default function Sidebar({ isOpen, onClose, activePage, onSelectPage }) {
  const menuItems = [
    { id: 'BasicCalc', label: 'Basic Calculator', icon: Home },
    { id: 'ScientificCalc', label: 'Scientific Calculator', icon: Calculator },
    { id: 'ProgrammerCalc', label: 'Programmer Calculator', icon: Binary },
    { id: 'FinancialCalc', label: 'Financial Calculator', icon: DollarSign },
    { id: 'PrintingCalc', label: 'Printing Calculator', icon: Printer },
    { id: 'GraphingCalc', label: 'Graphing Calculator', icon: TrendingUp },
    { id: 'UnitConverter', label: 'Unit Converter', icon: Scale },
    { id: 'DateCalc', label: 'Date Calculator', icon: Calendar },
    { id: 'BasicMath', label: 'Basic Math', icon: Sigma },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>My Calc</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                onSelectPage(item.id);
                onClose();
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
