import React, { useState } from 'react';
import { create, all } from 'mathjs';
import '../styles/unit-converter.scss';

const math = create(all);

const categories = {
  Length: ['meter', 'inch', 'foot', 'yard', 'mile', 'kilometer', 'centimeter'],
  Mass: ['gram', 'kilogram', 'pound', 'ounce', 'ton'],
  Volume: ['liter', 'gallon', 'milliliter', 'cup', 'pint'],
  Temperature: ['degC', 'degF', 'kelvin']
};

export default function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState(categories['Length'][0]);
  const [toUnit, setToUnit] = useState(categories['Length'][1]);
  const [inputValue, setInputValue] = useState('1');

  const convert = () => {
    try {
      if (inputValue === '') return '';
      // mathjs requires units to be passed specifically
      // e.g. math.unit(10, 'kg').to('lbs').toNumber()
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
    </div>
  );
}
