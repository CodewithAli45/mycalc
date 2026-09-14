export interface LoanInput {
  principal: number
  annualRate: number
  tenureMonths: number
}

export interface LoanResult {
  principal: number
  tenureMonths: number
  emi: number
  totalPayment: number
  totalInterest: number
  amortization: { month: number; principal: number; interest: number; balance: number }[]
}

export function calculateEMI(input: LoanInput): LoanResult {
  const { principal, annualRate, tenureMonths } = input
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    throw new Error("Invalid inputs")
  }

  if (annualRate === 0) {
    const emi = principal / tenureMonths
    const amortization = Array.from({ length: tenureMonths }, (_, i) => ({
      month: i + 1,
      principal: emi,
      interest: 0,
      balance: Math.max(0, principal - emi * (i + 1))
    }))
    return {
      principal,
      tenureMonths,
      emi,
      totalPayment: principal,
      totalInterest: 0,
      amortization
    }
  }

  const monthlyRate = annualRate / 100 / 12
  const factor = Math.pow(1 + monthlyRate, tenureMonths)
  const emi = (principal * monthlyRate * factor) / (factor - 1)
  const amortization: LoanResult["amortization"] = []
  let balance = principal
  let totalInterest = 0

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * monthlyRate
    const prin = emi - interest
    balance = Math.max(0, balance - prin)
    totalInterest += interest
    amortization.push({
      month: m,
      principal: prin,
      interest,
      balance
    })
  }

  return {
    principal,
    tenureMonths,
    emi,
    totalPayment: emi * tenureMonths,
    totalInterest,
    amortization
  }
}

export interface SimpleInterestInput {
  principal: number
  rate: number
  timeYears: number
}

export function calculateSimpleInterest(input: SimpleInterestInput): {
  principal: number
  interest: number
  total: number
} {
  const interest = (input.principal * input.rate * input.timeYears) / 100
  return { principal: input.principal, interest, total: input.principal + interest }
}

export type CompoundFrequency = 1 | 2 | 4 | 6 | 12

export interface CompoundInterestInput {
  principal: number
  rate: number
  timeYears: number
  frequency: CompoundFrequency
}

export function calculateCompoundInterest(input: CompoundInterestInput): {
  principal: number
  interest: number
  total: number
} {
  const { principal, rate, timeYears, frequency } = input
  const n = frequency
  const t = timeYears
  const r = rate / 100
  const amount = principal * Math.pow(1 + r / n, n * t)
  return { principal, interest: amount - principal, total: amount }
}