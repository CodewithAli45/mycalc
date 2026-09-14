import { deflateSync } from "node:zlib"
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT = join(ROOT, "public", "icons")
mkdirSync(OUT, { recursive: true })

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ])
}

function roundedRect(x, y, w, h, r) {
  return (px, py) => {
    if (px < x || px >= x + w || py < y || py >= y + h) return false
    const cx = Math.max(x + r, Math.min(px, x + w - r))
    const cy = Math.max(y + r, Math.min(py, y + h - r))
    const dx = px - cx
    const dy = py - cy
    return dx * dx + dy * dy <= r * r
  }
}

function drawIcon(size, padding, maskable) {
  const rgba = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = 11
    rgba[i * 4 + 1] = 15
    rgba[i * 4 + 2] = 23
    rgba[i * 4 + 3] = 255
  }

  const bg = roundedRect(padding, padding, size - 2 * padding, size - 2 * padding, size * 0.18)
  const body = roundedRect(size * 0.2, size * 0.28, size * 0.6, size * 0.5, size * 0.08)
  const screen = roundedRect(size * 0.25, size * 0.33, size * 0.5, size * 0.1, size * 0.02)
  const btns = [
    [0.25, 0.48, 0.5, 0.52],
    [0.63, 0.58, 0.5, 0.52],
    [0.25, 0.7, 0.5, 0.52]
  ]

  const inGroup = (groups, px, py) => groups.some((g) => g(px, py))
  const inBtn = (px, py) =>
    btns.some(([sx, sy, cw, ch]) => {
      const s = size
      return (
        px >= s * sx &&
        px < s * (sx + cw) &&
        py >= s * sy &&
        py < s * (sy + ch)
      )
    })

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5
      const py = y + 0.5
      const i = (y * size + x) * 4
      if (!bg(px, py)) {
        if (maskable) {
          rgba[i] = 11
          rgba[i + 1] = 15
          rgba[i + 2] = 23
        } else {
          rgba[i] = rgba[i + 3] = 0
        }
        continue
      }
      rgba[i] = rgba[i + 1] = rgba[i + 2] = rgba[i + 3] = 255
      if (body(px, py)) {
        const t = 0.06 + (px - size * 0.2) / (size * 0.6) * 0.08
        rgba[i] = Math.round(17 + t * 19)
        rgba[i + 1] = Math.round(28 + t * 22)
        rgba[i + 2] = Math.round(45 + t * 30)
        const [r, g, b] = inBtn(px, py) ? [56, 189, 248] : [111, 130, 169]
        if (inBtn(px, py)) {
          const grad = (py - size * 0.48) / (size * 0.52)
          rgba[i] = Math.round(56 - grad * 18)
          rgba[i + 1] = Math.round(189 - grad * 40)
          rgba[i + 2] = Math.round(248 - grad * 70)
        } else if (screen(px, py)) {
          rgba[i] = 15
          rgba[i + 1] = 23
          rgba[i + 2] = 42
        } else {
          rgba[i] = r
          rgba[i + 1] = g
          rgba[i + 2] = b
        }
      }
      void inGroup
    }
  }
  return rgba
}

const sizes = [192, 512]
for (const size of sizes) {
  for (const maskable of [false, true]) {
    const rgba = drawIcon(size, maskable ? Math.round(size * 0.05) : 0, maskable)
    const png = encodePNG(size, size, rgba)
    const name = maskable ? `icon-maskable-${size}.png` : `icon-${size}.png`
    writeFileSync(join(OUT, name), png)
    console.log(`wrote ${name} (${png.length} bytes)`)
  }
}