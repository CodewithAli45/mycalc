export interface Measurement {
  feet: number
  inches: number
}

export function toTotalInches(m: Measurement): number {
  return m.feet * 12 + m.inches
}

export function fromTotalInches(totalInches: number): Measurement {
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches - feet * 12
  return { feet, inches }
}

function formatInches(inches: number): string {
  const whole = Math.floor(inches)
  const frac = inches - whole
  if (frac < 0.01) return `${whole}"`
  const nearest8 = Math.round(frac * 8)
  if (nearest8 % 4 === 0) return `${whole + nearest8 / 4}"`
  return `${whole} ${nearest8}/8"`
}

export function formatMeasurement(m: Measurement): string {
  const total = toTotalInches(m)
  const whole = Math.floor(total)
  if (whole % 12 === 0) {
    const inches = total - whole
    if (Math.abs(inches) < 0.01) return `${whole / 12}'`
    return `${whole / 12}' ${formatInches(inches)}`
  }
  const feet = Math.floor(whole / 12)
  const inches = total - feet * 12
  if (Math.abs(inches) < 0.01) return `${feet}'`
  return `${feet}' ${formatInches(inches)}`
}

export function addMeasurements(a: Measurement, b: Measurement): Measurement {
  return fromTotalInches(toTotalInches(a) + toTotalInches(b))
}

export function subtractMeasurements(a: Measurement, b: Measurement): Measurement {
  return fromTotalInches(toTotalInches(a) - toTotalInches(b))
}

export function measurementToFeet(m: Measurement): number {
  return m.feet + m.inches / 12
}

export function calculateArea(l: Measurement, b: Measurement): {
  sqft: number
  sqm: number
} {
  const lft = measurementToFeet(l)
  const bft = measurementToFeet(b)
  const sqft = lft * bft
  const sqm = sqft * 0.09290304
  return { sqft, sqm }
}