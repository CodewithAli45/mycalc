import { Menu } from 'lucide-react';

export default function Header({ activeCalculator, onToggleMenu }) {
  return (
    <header className="app-header">
      <button className="menu-btn" onClick={onToggleMenu} aria-label="Menu">
        <Menu size={28} color="white" />
      </button>
      <h1>{activeCalculator}</h1>
      <div style={{ width: 28 }}></div> {/* Spacer for centering */}
    </header>
  );
}
