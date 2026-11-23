import { colorHex } from '../../data/colors'

// Original flat clothing illustrations (drawn for Style Aura, no stock images).
// Every shape uses a 100×100 viewBox, a dark outline and the item's colour.
const OUTLINE = '#2A2430'

function shade(hex, amount = -0.18) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + c * amount)))
  const r = f(n >> 16)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const SHAPES = {
  tshirt: (c, d) => (
    <>
      <path d="M30 20 L42 14 Q50 21 58 14 L70 20 L86 34 L76 45 L70 39 L70 86 L30 86 L30 39 L24 45 L14 34 Z" fill={c} />
      <path d="M42 14 Q50 24 58 14" fill="none" stroke={d} />
    </>
  ),
  babytee: (c, d) => (
    <>
      <path d="M32 28 L42 22 Q50 28 58 22 L68 28 L80 38 L72 46 L68 42 L68 72 L32 72 L32 42 L28 46 L20 38 Z" fill={c} />
      <path d="M42 22 Q50 31 58 22" fill="none" stroke={d} />
      <circle cx="50" cy="48" r="5" fill={d} stroke="none" />
    </>
  ),
  sweater: (c, d) => (
    <>
      <path d="M30 20 L42 14 Q50 21 58 14 L70 20 L84 62 L75 65 L70 44 L70 86 L30 86 L30 44 L25 65 L16 62 Z" fill={c} />
      <path d="M32 80 H68 M42 14 Q50 24 58 14" fill="none" stroke={d} />
    </>
  ),
  hoodie: (c, d) => (
    <>
      <path d="M38 20 Q50 0 62 20" fill={d} />
      <path d="M30 22 L42 16 Q50 26 58 16 L70 22 L84 64 L75 67 L70 46 L70 88 L30 88 L30 46 L25 67 L16 64 Z" fill={c} />
      <path d="M38 62 H62 L60 76 H40 Z" fill={d} />
      <path d="M46 24 V38 M54 24 V38" fill="none" />
    </>
  ),
  shirt: (c, d) => (
    <>
      <path d="M30 20 L42 14 L50 22 L58 14 L70 20 L84 62 L75 65 L70 44 L70 86 L30 86 L30 44 L25 65 L16 62 Z" fill={c} />
      <path d="M42 14 L46 26 L50 22 L54 26 L58 14 M50 22 V86" fill="none" stroke={d} />
      <circle cx="50" cy="40" r="1.6" fill={d} />
      <circle cx="50" cy="54" r="1.6" fill={d} />
      <circle cx="50" cy="68" r="1.6" fill={d} />
    </>
  ),
  jeans: (c, d) => (
    <>
      <path d="M30 12 L70 12 L74 88 L56 88 L50 36 L44 88 L26 88 Z" fill={c} />
      <path d="M30 20 H70 M36 20 Q38 30 30 30 M64 20 Q62 30 70 30" fill="none" stroke={d} />
    </>
  ),
  trousers: (c, d) => (
    <>
      <path d="M30 12 L70 12 L72 88 L55 88 L50 34 L45 88 L28 88 Z" fill={c} />
      <path d="M30 19 H70 M38 24 L36 88 M62 24 L64 88" fill="none" stroke={d} />
    </>
  ),
  cargo: (c, d) => (
    <>
      <path d="M28 12 L72 12 L78 88 L56 88 L50 38 L44 88 L22 88 Z" fill={c} />
      <path d="M28 20 H72" fill="none" stroke={d} />
      <rect x="24" y="50" width="12" height="14" rx="2" fill={d} />
      <rect x="64" y="50" width="12" height="14" rx="2" fill={d} />
    </>
  ),
  skirt: (c, d) => (
    <>
      <path d="M34 24 L66 24 L80 76 L20 76 Z" fill={c} />
      <path d="M34 31 H66 M42 31 L36 76 M58 31 L64 76 M50 31 V76" fill="none" stroke={d} />
    </>
  ),
  shorts: (c, d) => (
    <>
      <path d="M28 26 L72 26 L76 64 L54 64 L50 44 L46 64 L24 64 Z" fill={c} />
      <path d="M28 33 H72" fill="none" stroke={d} />
    </>
  ),
  dress: (c, d) => (
    <>
      <path d="M40 10 L46 10 Q50 17 54 10 L60 10 L62 30 L57 38 L78 88 L22 88 L43 38 L38 30 Z" fill={c} />
      <path d="M43 38 H57" fill="none" stroke={d} />
    </>
  ),
  blazer: (c, d) => (
    <>
      <path d="M30 18 L42 12 L50 42 L58 12 L70 18 L84 70 L76 72 L70 46 L70 84 L30 84 L30 46 L24 72 L16 70 Z" fill={c} />
      <path d="M42 12 L38 34 L50 42 L62 34 L58 12" fill={d} />
      <circle cx="50" cy="56" r="2" fill={OUTLINE} />
      <circle cx="50" cy="68" r="2" fill={OUTLINE} />
    </>
  ),
  jacket: (c, d) => (
    <>
      <path d="M30 18 L42 12 Q50 18 58 12 L70 18 L84 66 L76 68 L70 46 L70 78 L30 78 L30 46 L24 68 L16 66 Z" fill={c} />
      <path d="M50 16 V78 M30 72 H70" fill="none" stroke={d} />
      <path d="M42 12 L46 22 L50 16 L54 22 L58 12" fill={d} />
    </>
  ),
  coat: (c, d) => (
    <>
      <path d="M30 16 L42 10 L50 34 L58 10 L70 16 L84 72 L76 74 L70 46 L72 94 L28 94 L30 46 L24 74 L16 72 Z" fill={c} />
      <path d="M42 10 L38 28 L50 34 L62 28 L58 10" fill={d} />
      <rect x="29" y="56" width="42" height="6" fill={d} />
      <path d="M50 34 V94" fill="none" stroke={d} />
    </>
  ),
  sneakers: (c, d) => (
    <>
      <path d="M10 62 L13 42 Q24 40 34 50 L56 54 Q78 56 88 66 L90 72 L10 72 Z" fill={c} />
      <rect x="9" y="70" width="82" height="8" rx="3" fill="#FFFFFF" />
      <path d="M36 52 L40 46 M44 54 L48 47 M52 55 L55 49" fill="none" stroke={d} />
      <path d="M14 62 H40" fill="none" stroke={d} />
    </>
  ),
  boots: (c, d) => (
    <>
      <path d="M30 14 L54 14 L56 56 Q78 58 86 70 L86 78 L30 78 Z" fill={c} />
      <rect x="28" y="76" width="60" height="9" rx="2" fill={d} />
      <path d="M36 24 H50 M36 34 H50 M36 44 H50" fill="none" stroke={d} />
    </>
  ),
  loafers: (c, d) => (
    <>
      <path d="M10 66 Q12 52 30 52 L60 54 Q82 56 90 68 L90 74 L10 74 Z" fill={c} />
      <rect x="9" y="72" width="82" height="6" rx="2" fill={d} />
      <path d="M50 54 Q58 62 70 58" fill="none" stroke={d} />
    </>
  ),
  heels: (c, d) => (
    <>
      <path d="M14 46 Q32 48 46 64 L80 64 Q88 64 88 72 L46 72 L22 58 Z" fill={c} />
      <path d="M18 54 L20 86 L25 86 L26 58" fill={d} />
    </>
  ),
  cap: (c, d) => (
    <>
      <path d="M22 60 Q22 26 52 26 Q80 26 80 60 Z" fill={c} />
      <path d="M72 60 Q94 58 96 66 L72 66 Z" fill={d} />
      <path d="M52 26 V60 M36 32 Q42 46 40 60" fill="none" stroke={d} />
      <circle cx="52" cy="25" r="3" fill={d} />
    </>
  ),
  beanie: (c, d) => (
    <>
      <path d="M26 60 Q26 26 50 26 Q74 26 74 60 Z" fill={c} />
      <rect x="24" y="56" width="52" height="14" rx="3" fill={d} />
      <circle cx="50" cy="22" r="7" fill={d} />
    </>
  ),
  bag: (c, d) => (
    <>
      <path d="M36 44 Q36 20 50 20 Q64 20 64 44" fill="none" strokeWidth="4" />
      <path d="M20 44 L80 44 L75 86 L25 86 Z" fill={c} />
      <path d="M20 54 H80" fill="none" stroke={d} />
      <rect x="45" y="50" width="10" height="9" rx="2" fill={d} />
    </>
  ),
  necklace: (c, d) => (
    <>
      <path d="M26 18 Q50 76 74 18" fill="none" stroke={d} strokeWidth="3" />
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => {
        const x = (1 - t) * (1 - t) * 26 + 2 * (1 - t) * t * 50 + t * t * 74
        const y = (1 - t) * (1 - t) * 18 + 2 * (1 - t) * t * 76 + t * t * 18
        return <circle key={t} cx={x} cy={y} r="3.5" fill={c} />
      })}
      <circle cx="50" cy="56" r="7" fill={c} />
    </>
  ),
  sunglasses: (c, d) => (
    <>
      <path d="M8 40 H92" fill="none" stroke={d} strokeWidth="3" />
      <rect x="12" y="38" width="32" height="24" rx="10" fill={c} />
      <rect x="56" y="38" width="32" height="24" rx="10" fill={c} />
      <path d="M44 44 Q50 38 56 44" fill="none" />
    </>
  ),
  belt: (c, d) => (
    <>
      <rect x="6" y="40" width="88" height="18" rx="4" fill={c} />
      <rect x="40" y="36" width="20" height="26" rx="3" fill="#C9CCD3" />
      {[16, 26, 70, 80].map((x) => (
        <circle key={x} cx={x} cy="49" r="2.6" fill="#C9CCD3" />
      ))}
      <path d="M50 42 V56" fill="none" stroke={d} />
    </>
  ),
  sock: (c, d) => (
    <>
      <path d="M38 10 L60 10 L60 54 Q62 64 72 68 L84 74 Q92 82 84 90 L56 90 Q40 88 40 70 Z" fill={c} />
      <rect x="37" y="10" width="24" height="10" fill={d} />
      <circle cx="50" cy="40" r="3" fill={d} />
      <circle cx="56" cy="76" r="3" fill={d} />
    </>
  ),
  heart: (c) => <path d="M50 84 C18 62 10 44 18 30 C26 16 44 18 50 32 C56 18 74 16 82 30 C90 44 82 62 50 84 Z" fill={c} />,
}

/**
 * <GarmentArt kind="hoodie" color="black" />
 * `label` gives it an accessible name; without it the drawing is decorative.
 */
export default function GarmentArt({ kind, color, label, className = 'h-full w-full' }) {
  const hex = color?.startsWith?.('#') ? color : colorHex(color)
  const draw = SHAPES[kind] ?? SHAPES.tshirt
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill="none"
      stroke={OUTLINE}
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {draw(hex, shade(hex))}
    </svg>
  )
}
