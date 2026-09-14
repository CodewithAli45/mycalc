# Engineer's Dashboard

A responsive, installable **Personal Dashboard PWA** built with **Next.js (App Router)**, TypeScript and Tailwind CSS. It bundles a full engineering calculator suite — basic & scientific calculators, loan/finance analysis, civil feet-inches arithmetic and land-area conversion — designed around a clean, professional **dark-mode** aesthetic with full **offline support**.

![Dark mode dashboard preview](public/icons/icon-512.png)

## ✨ Features

### 🕒 Clock & Interactive Calendar
- Live local time in `HH:mm:ss` displayed in the app header.
- Tap the date to open a smooth animated calendar modal:
  - Month navigation, today highlighting, single-date selection
  - Works offline, with keyboard & touch friendly interactions.

### 🧮 Basic Calculator (Default View)
- Colour-coded keys: numbers, operators, **⌫ Backspace** and **AC Clear**.
- Compact history log showing the **last 5 calculations** above the display.
- Smart **ANS memory** system powered by `localStorage`:
  - The most recent result is stored as `ANS` after every calculation.
  - **ANS button** inserts the previous answer anywhere in an expression (beginning, middle or end — cursor-aware).
  - **Chaining**: pressing an operator right after `ANS` (or after `=`) automatically uses the stored ANS as the starting operand.
  - Every completed calculation immediately updates the stored ANS value — shared live between the basic and scientific calculators.

### 🔬 Scientific Calculator
- Trigonometric functions with **DEG / RAD** toggle: `sin · cos · tan` plus inverse (`asin · acos · atan`) and hyperbolic (`sinh · cosh · tanh`) layers via the **2nd** key.
- Logarithms: `ln`, `log₁₀`, `log₂(x, y)`.
- Exponents & roots: `x²`, `x³`, `xʸ`, `eˣ`, `√x`, `x!`, reciprocal via `±`.
- Parenthesised expressions and constants `π` and `e`.
- Shares the same ANS memory as the basic calculator.

### 💰 Financial Calculator
- **Loan / EMI analysis** — monthly EMI, total interest and total payable.
- **Amortization schedule** — full month-by-month table with principal, interest and balance.
- **Breakdown visualization** — Principal vs. Interest donut chart plus percentage split.
- **Simple Interest** and **Compound Interest** with customizable compounding frequency (monthly, quarterly, half-yearly, annually) and a visual comparison.

### 📐 Civil / Mechanical Area Calculator
- **Feet-inches arithmetic**: add and subtract measurements such as `25' 8" + 14' 7" → 40' 3"` (and `483"` total).
- **Area calculation**: `Length × Breadth` entered in feet + inches outputs instantly in both **Square Feet (sq ft)** and **Square Meters (sq m)**.

### 🔁 Unit & Land Area Converter
- Seamless conversion across standard and regional land units:
  - **Decimal** (regional Indian unit — `1 Decimal = 436 sq ft`)
  - **Square Feet (sq ft)** · **Square Meters (sq m)**
  - **Acres** · **Hectares** · **Bigha** (`1 Bigha = 27,225 sq ft`)
- Full conversion table of the current value across all units plus quick reference lookups.

### 📱 Progressive Web App (PWA)
- Complete `manifest.webmanifest` — installable (install prompt), standalone display, themed, with generated maskable + standard icons.
- Service worker (`public/sw.js`) with precaching, runtime caching and an **offline fallback page**.
- Online / offline indicator and an **"Install app"** button triggered by `beforeinstallprompt`.
- Deep-linkable tabs via `/?tab=basic|scientific|finance|area|converter` (also used by PWA shortcuts).

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| PWA | Hand-rolled manifest + service worker |
| Icons | Zero-dependency Node PNG generator |

## 🚀 Getting Started

```bash
# install dependencies
npm install

# start the dev server
npm run dev
# → http://localhost:3000

# production build
npm run build

# run the production server
npm run start

# lint
npm run lint

# (re)generate PWA icons
npm run icons
```

## 📁 Project Structure

```
├── public/
│   ├── icons/                 # Generated PWA icons (192/512, any + maskable)
│   ├── manifest.webmanifest   # PWA manifest
│   ├── sw.js                  # Service worker (offline support)
│   └── offline.html           # Offline fallback page
├── scripts/
│   └── generate-icons.mjs     # Dependency-free PNG icon generator
└── src/
    ├── app/
    │   ├── layout.tsx         # Root layout, metadata, PWA manifest link
    │   ├── page.tsx           # Home page → Dashboard
    │   └── globals.css        # Tailwind import + dark theme tokens
    ├── components/
    │   ├── Dashboard.tsx      # Shell: header clock + tab navigation
    │   ├── Clock.tsx          # Live clock + calendar modal
    │   ├── Calculator.tsx     # Basic calculator (history + ANS)
    │   ├── Scientific.tsx     # Scientific calculator
    │   ├── Financial.tsx      # EMI / interest suite + charts
    │   ├── AreaCalculator.tsx # Feet-inches arithmetic + area
    │   ├── UnitConverter.tsx  # Land / unit converter
    │   └── PwaRuntime.tsx     # SW registration + install prompt
    └── lib/
        ├── calc.ts            # Expression tokenizer/evaluator (DEG/RAD support)
        ├── finance.ts         # EMI, amortization, interest math
        ├── area.ts            # Feet-inches & area math
        ├── units.ts           # Land unit conversion tables
        ├── calendar.ts        # Calendar grid helpers
        └── useLocalStorage.ts # SSR-safe reactive localStorage hook
```

## 🔐 Persistence

| `localStorage` key  | Purpose                                   |
|---------------------|-------------------------------------------|
| `edash-ans`         | Most recent result (shared ANS memory)    |
| `edash-history`     | Last 5 basic-calculator calculations      |

The `useLocalStorage` hook builds on `useSyncExternalStore`, so ANS updates are **reactive across components** and hydration-safe.

## ☁️ Deploy to Vercel

The project is already **Vercel-ready**:

1. Push this repository to GitHub (done — `git push origin main`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects **Next.js** — no configuration needed.
4. Click **Deploy**.

Or from the CLI:

```bash
npm i -g vercel
vercel
```

### Notes for a smooth deployment
- The build script is the standard `next build` and is verified locally before each push.
- `.npmrc` includes the allowed install scripts used by the toolchain — Vercel honours it during `npm install`.
- PWA assets (`/manifest.webmanifest`, `/sw.js`, icons) are static files under `public/`, served as-is.
- After deploy, open the site on a phone or desktop browser → the address bar "Install" control appears (or use the in-app **Install app** button).

## 🧪 Verification

Core calculation engines are unit-tested with Node's native TypeScript support:

```bash
node /tmp/opencode/test-lib.mjs        # 24 logic assertions (calc, area, finance, units)
```

Run `npm run build` and `npm run lint` — both must pass cleanly before merging.

## 📄 License

See the original repository history for licensing. This rewrite is provided as a personal engineering dashboard.