import { create, all } from 'mathjs';

const config = { };
const math = create(all, config);

export const evaluateExpression = (expression, scope = {}) => {
  try {
    // Replace visual operators with mathjs operators
    const sanitized = expression
      .replace(/x/g, '*')
      .replace(/÷/g, '/')
      .replace(/√(\d+(?:\.\d+)?|\([^)]+\))/g, 'sqrt($1)')
      .replace(/%/g, '/100');
    
    return math.evaluate(sanitized, scope);
  } catch (error) {
    console.error("Calculation Error:", error);
    return "Error";
  }
};

export const scientificFunctions = {
  sin: (val) => math.sin(val),
  cos: (val) => math.cos(val),
  tan: (val) => math.tan(val),
  log: (val) => math.log(val, 10),
  ln: (val) => math.log(val),
  sqrt: (val) => math.sqrt(val),
  power: (base, exp) => math.pow(base, exp),
  factorial: (val) => math.factorial(val),
};
