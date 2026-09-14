export type Token =
  | { type: "number"; value: number }
  | { type: "const"; id: "pi" | "e" }
  | { type: "fn"; id: string }
  | { type: "op"; id: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" }

const NUMS = /[0-9.]/
const IDS = /[a-zA-Z_]/

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let last: Token | null = null

  const isUnaryContext = (): boolean => {
    if (tokens.length === 0) return true
    const t = tokens[tokens.length - 1]
    return (
      t.type === "op" ||
      t.type === "lparen" ||
      t.type === "comma" ||
      t.type === "fn"
    )
  }

  while (i < input.length) {
    const c = input[i]

    if (c === " ") {
      i++
      continue
    }

    if (NUMS.test(c)) {
      let num = ""
      while (i < input.length && NUMS.test(input[i])) {
        num += input[i]
        i++
      }
      if (num.startsWith(".")) num = "0" + num
      if (num.endsWith(".")) num += "0"
      if (
        (input[i] === "e" || input[i] === "E") &&
        /[+\-0-9]/.test(input[i + 1] ?? "")
      ) {
        let j = i + 1
        if (input[j] === "+" || input[j] === "-") j++
        let expDigits = 0
        while (j < input.length && /[0-9]/.test(input[j])) {
          j++
          expDigits++
        }
        if (expDigits > 0) {
          num += input.slice(i, j)
          i = j
        }
      }
      const value = parseFloat(num)
      if (Number.isNaN(value)) throw new Error("Invalid number")
      tokens.push({ type: "number", value })
      last = tokens[tokens.length - 1]
      continue
    }

    if (IDS.test(c)) {
      let id = ""
      while (i < input.length && IDS.test(input[i])) {
        id += input[i]
        i++
      }
      const lower = id.toLowerCase()
      if (lower === "pi" || lower === "π") {
        tokens.push({ type: "const", id: "pi" })
      } else if (lower === "e") {
        tokens.push({ type: "const", id: "e" })
      } else {
        tokens.push({ type: "fn", id: lower })
      }
      last = tokens[tokens.length - 1]
      continue
    }

    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      if (c === "-" && isUnaryContext()) {
        tokens.push({ type: "number", value: -1 })
        tokens.push({ type: "op", id: "*" })
      } else if (c === "+") {
        if (isUnaryContext() && last) {
          // ignore unary plus
        } else {
          tokens.push({ type: "op", id: "+" })
        }
      } else {
        tokens.push({ type: "op", id: c })
      }
      last = tokens[tokens.length - 1]
      i++
      continue
    }

    if (c === "(") {
      tokens.push({ type: "lparen" })
      last = tokens[tokens.length - 1]
      i++
      continue
    }

    if (c === ")") {
      tokens.push({ type: "rparen" })
      last = tokens[tokens.length - 1]
      i++
      continue
    }

    if (c === ",") {
      tokens.push({ type: "comma" })
      last = tokens[tokens.length - 1]
      i++
      continue
    }

    throw new Error(`Unexpected character: ${c}`)
  }

  return tokens
}

export function evaluateTokens(tokens: Token[], degMode = false): number {
  let pos = 0

  function peek(): Token | null {
    return tokens[pos] ?? null
  }

  function advance(): Token {
    const t = tokens[pos]
    if (!t) throw new Error("Unexpected end of expression")
    pos++
    return t
  }

  function parsePrimary(): number {
    const t = peek()
    if (!t) throw new Error("Unexpected end of expression")

    if (t.type === "number") {
      advance()
      return t.value
    }
    if (t.type === "const") {
      advance()
      return t.id === "pi" ? Math.PI : Math.E
    }
    if (t.type === "lparen") {
      advance()
      const v = parseExpression()
      const closing = peek()
      if (!closing || closing.type !== "rparen") throw new Error("Missing )")
      advance()
      return v
    }
    if (t.type === "fn") {
      advance()
      const lparen = peek()
      if (!lparen || lparen.type !== "lparen") throw new Error(`Missing ( for ${t.id}`)
      advance()
      const value = parseExpression()
      const closing = peek()
      if (closing && closing.type === "comma") {
        advance()
        const second = parseExpression()
        advance()
        return applyBinaryFn(t.id, value, second)
      }
      if (!closing || closing.type !== "rparen") throw new Error(`Missing ) for ${t.id}`)
      advance()
      return applyFunction(t.id, value, degMode)
    }
    if (t.type === "op" && (t.id === "+" || t.id === "-")) {
      advance()
      const v = parsePrimary()
      return t.id === "-" ? -v : v
    }
    throw new Error("Invalid expression")
  }

  function parseUnary(): number {
    const t = peek()
    if (t && t.type === "op" && t.id === "-") {
      advance()
      return -parseUnary()
    }
    if (t && t.type === "op" && t.id === "+") {
      advance()
      return parseUnary()
    }
    return parsePrimary()
  }

  function parseExponent(): number {
    const left = parseUnary()
    const t = peek()
    if (t && t.type === "op" && t.id === "^") {
      advance()
      const right = parseExponent()
      return Math.pow(left, right)
    }
    return left
  }

  function parseMulDiv(): number {
    let left = parseExponent()
    while (true) {
      const t = peek()
      if (t && t.type === "op" && (t.id === "*" || t.id === "/")) {
        advance()
        const right = parseExponent()
        left = t.id === "*" ? left * right : left / right
      } else {
        break
      }
    }
    return left
  }

  function parseExpression(): number {
    let left = parseMulDiv()
    while (true) {
      const t = peek()
      if (t && t.type === "op" && (t.id === "+" || t.id === "-")) {
        advance()
        const right = parseMulDiv()
        left = t.id === "+" ? left + right : left - right
      } else {
        break
      }
    }
    return left
  }

  const result = parseExpression()
  if (pos !== tokens.length) throw new Error("Trailing tokens in expression")
  return result
}

export function applyFunction(fn: string, x: number, deg = false): number {
  switch (fn) {
    case "sin":
      return Math.sin(deg ? x * RAD : x)
    case "cos":
      return Math.cos(deg ? x * RAD : x)
    case "tan":
      return Math.tan(deg ? x * RAD : x)
    case "sinh":
      return Math.sinh(x)
    case "cosh":
      return Math.cosh(x)
    case "tanh":
      return Math.tanh(x)
    case "asin":
      return deg ? Math.asin(x) / RAD : Math.asin(x)
    case "acos":
      return deg ? Math.acos(x) / RAD : Math.acos(x)
    case "atan":
      return deg ? Math.atan(x) / RAD : Math.atan(x)
    case "ln":
      return Math.log(x)
    case "log":
      return Math.log10(x)
    case "sqrt":
      return Math.sqrt(x)
    case "cbrt":
      return Math.cbrt(x)
    case "abs":
      return Math.abs(x)
    case "floor":
      return Math.floor(x)
    case "ceil":
      return Math.ceil(x)
    case "round":
      return Math.round(x)
    case "exp":
      return Math.exp(x)
    case "fact":
    case "!":
      return factorial(Math.round(x))
    default:
      throw new Error(`Unknown function: ${fn}`)
  }
}

export function applyBinaryFn(fn: string, a: number, b: number): number {
  switch (fn) {
    case "pow":
      return Math.pow(a, b)
    case "logb":
      return Math.log(a) / Math.log(b)
    case "max":
      return Math.max(a, b)
    case "min":
      return Math.min(a, b)
    default:
      throw new Error(`Unknown function: ${fn}`)
  }
}

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial of negative/non-integer")
  if (n > 170) return Infinity
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

export function evaluate(expr: string, deg = false): number {
  return evaluateTokens(tokenize(transformFactorials(expr)), deg)
}

const RAD = Math.PI / 180

function transformFactorials(expr: string): string {
  return expr.replace(/([0-9.]+)!/g, "fact($1)")
}

export function formatNumber(value: number, maxDigits = 12): string {
  if (!Number.isFinite(value)) return "Error"
  if (value === 0) return "0"
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-9) {
    return value.toExponential(6).replace(/\.?0+e/, "e")
  }
  const rounded = parseFloat(value.toPrecision(maxDigits))
  let str = String(rounded)
  if (str.length > maxDigits + 2 && !str.includes("e")) {
    const exp = Math.floor(Math.log10(abs))
    if (exp >= maxDigits) {
      str = value.toExponential(Math.max(2, maxDigits - 4))
    }
  }
  return str
}

const ESCAPED = /([+\-*/\^()])/g

export function escapeNumber(value: number): string {
  return formatNumber(value).replace(ESCAPED, "")
}

export function isBalanced(expr: string): boolean {
  let depth = 0
  for (const ch of expr) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (depth < 0) return false
  }
  return depth === 0
}