import React, { useState } from 'react';
import { create, all } from 'mathjs';
import AreaFinder from '../components/AreaFinder';
import '../styles/unit-converter.scss';

const math = create(all);

// Add custom regional area units
try {
  math.createUnit({
    decimal: '435.6 sqft',
    katha: '720 sqft',
    bigha: '14400 sqft'
  });
} catch (e) {
  // Unit may already exist if component re-renders/is updated during dev
}

const categories = {
  Length: ['meter', 'inch', 'foot', 'yard', 'mile', 'kilometer', 'centimeter'],
  Mass: ['gram', 'kilogram', 'pound', 'ounce', 'ton'],
  Volume: ['liter', 'gallon', 'milliliter', 'cup', 'pint'],
  Temperature: ['degC', 'degF', 'kelvin'],
  Area: ['m2', 'sqft', 'sqinch', 'sqmile', 'acre', 'hectare', 'km2', 'bigha', 'katha', 'decimal']
};

export default function UnitConverter() {
  const [mode, setMode] = useState('converter'); // 'converter' or 'area'
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState(categories['Length'][0]);
  const [toUnit, setToUnit] = useState(categories['Length'][1]);
  const [inputValue, setInputValue] = useState('1');

  const convert = () => {
    try {
      if (inputValue === '') return '';
      const u = math.unit(parseFloat(inputValue), fromUnit);
      return u.to(toUnit).toNumber().toFixed(4);
    } catch {
      return 'Error';
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setFromUnit(categories[cat][0]);
    setToUnit(categories[cat][1]);
  };

  return (
    <div className="calculator-wrapper unit-converter">
      <div className="mode-toggle">
        <button 
          className={mode === 'converter' ? 'active' : ''} 
          onClick={() => setMode('converter')}
        >
          Unit Converter
        </button>
        <button 
          className={mode === 'area' ? 'active' : ''} 
          onClick={() => setMode('area')}
        >
          Area Finder
        </button>
      </div>

      {mode === 'converter' ? (
        <>
          <div className="category-selector">
            {Object.keys(categories).map(cat => (
              <button 
                key={cat} 
                className={category === cat ? 'active' : ''}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="conversion-area">
            <div className="input-group">
              <label>From</label>
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
              />
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                {categories[category].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="equals-sign">=</div>

            <div className="input-group">
              <label>To</label>
              <div className="result-display">{convert()}</div>
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                {categories[category].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </>
      ) : (
        <AreaFinder />
      )}
    </div>
  );
}
