export interface UnitDef {
  id: string
  label: string
  toSqft: number
}

export const UNIT: UnitDef[] = [
  { id: "sqft", label: "Square Feet (sq ft)", toSqft: 1 },
  { id: "sqm", label: "Square Meters (sq m)", toSqft: 1 / 0.09290304 },
  { id: "decimal", label: "Decimal", toSqft: 436 },
  { id: "acre", label: "Acre", toSqft: 43560 },
  { id: "hectare", label: "Hectare", toSqft: 107639.10416709722 },
  { id: "bigha", label: "Bigha", toSqft: 27225 }
]

export function convert(value: number, fromId: string, toId: string): number {
  const from = UNIT.find((u) => u.id === fromId)
  const to = UNIT.find((u) => u.id === toId)
  if (!from || !to) throw new Error("Invalid unit")
  const sqft = value * from.toSqft
  return sqft / to.toSqft
}