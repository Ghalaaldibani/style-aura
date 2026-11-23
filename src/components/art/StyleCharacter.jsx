// Original flat characters for the four styles (drawn for Style Aura).
// Used inside an SVG: <svg><StyleCharacter style="emo" /></svg>  — viewBox of one character: 100×150.
const O = '#2A2430'

const LOOKS = {
  emo: { skin: '#F6D9C6', top: '#2E2A33', accent: '#9466C9', hair: '#1E1B22' },
  y2k: { skin: '#F8DDCB', top: '#8EC9EE', accent: '#F2C94C', hair: '#F4D35E' },
  oldmoney: { skin: '#F1D2B8', top: '#F3EAD6', accent: '#C9CCD3', hair: '#7A4B2E' },
  streetwear: { skin: '#B97A50', top: '#F0A23B', accent: '#3FA796', hair: '#2A1D17' },
}

function Face({ skin }) {
  return (
    <>
      <circle cx="50" cy="52" r="17" fill={skin} />
      <circle cx="44" cy="52" r="1.8" fill={O} stroke="none" />
      <circle cx="56" cy="52" r="1.8" fill={O} stroke="none" />
      <circle cx="40" cy="58" r="2.6" fill="#F29BB1" stroke="none" />
      <circle cx="60" cy="58" r="2.6" fill="#F29BB1" stroke="none" />
      <path d="M46 60 Q50 63 54 60" fill="none" />
    </>
  )
}

const BODY = 'M20 150 L20 100 Q20 80 42 78 L58 78 Q80 80 80 100 L80 150 Z'

export default function StyleCharacter({ style }) {
  const l = LOOKS[style] ?? LOOKS.streetwear
  return (
    <g stroke={O} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      {style === 'emo' && <path d="M30 50 Q30 27 50 27 Q70 27 70 50 L73 104 L27 104 Z" fill={l.hair} />}
      {style === 'oldmoney' && <circle cx="50" cy="30" r="8" fill={l.hair} />}
      {style === 'y2k' && (
        <>
          <circle cx="33" cy="34" r="9" fill={l.hair} />
          <circle cx="67" cy="34" r="9" fill={l.hair} />
        </>
      )}

      <rect x="45" y="66" width="10" height="13" fill={l.skin} />
      <path d={BODY} fill={l.top} />

      {style === 'emo' && <path d="M24 122 H76 M22 132 H78" stroke={l.accent} strokeWidth="3" />}
      {style === 'y2k' && <path d="M50 108 L53 115 L61 115 L55 120 L57 128 L50 123 L43 128 L45 120 L39 115 L47 115 Z" fill={l.accent} />}
      {style === 'oldmoney' && (
        <>
          <path d="M42 78 L50 94 L58 78" fill="#FFFFFF" />
          <path d="M50 94 V150" />
          <circle cx="50" cy="110" r="1.5" fill={O} />
          <circle cx="50" cy="124" r="1.5" fill={O} />
          <path d="M43 79 Q50 86 57 79" fill="none" stroke={l.accent} strokeWidth="3" strokeDasharray="0.1 3.4" />
        </>
      )}
      {style === 'streetwear' && (
        <>
          <path d="M45 82 V100 M55 82 V100" />
          <path d="M40 80 Q50 92 60 80" fill="none" stroke="#F2C94C" strokeWidth="2.5" strokeDasharray="2 2" />
          <rect x="34" y="132" width="32" height="10" fill="#E08A20" />
        </>
      )}

      <Face skin={l.skin} />

      {style === 'emo' && (
        <>
          <path d="M33 50 Q35 31 52 31 Q67 32 68 46 Q58 40 49 49 Q42 56 33 57 Z" fill={l.hair} />
          <path d="M40 34 Q36 46 35 58" fill="none" stroke={l.accent} strokeWidth="3" />
        </>
      )}
      {style === 'y2k' && (
        <>
          <path d="M33 52 Q32 34 50 34 Q68 34 67 52 Q60 41 50 41 Q40 41 33 52 Z" fill={l.hair} />
          <circle cx="33" cy="61" r="3.5" fill="none" stroke="#E8893A" strokeWidth="2" />
          <circle cx="67" cy="61" r="3.5" fill="none" stroke="#E8893A" strokeWidth="2" />
        </>
      )}
      {style === 'oldmoney' && (
        <path d="M33 54 Q31 34 50 34 Q69 34 67 54 Q63 41 50 40 Q37 41 33 54 Z" fill={l.hair} />
      )}
      {style === 'streetwear' && (
        <>
          <path d="M33 56 Q33 44 36 42 L36 60 Z M67 56 Q67 44 64 42 L64 60 Z" fill={l.hair} />
          <path d="M31 45 Q31 26 50 26 Q69 26 69 45 Z" fill={l.accent} />
          <path d="M58 43 Q80 40 86 46 L60 48 Z" fill={l.accent} />
        </>
      )}
    </g>
  )
}

const DOT_COLORS = ['#E2574C', '#F2C94C', '#3FA796', '#4A78C2', '#9466C9', '#E8893A']

// Decorative frame with coloured dots, like the Figma illustrations.
export function DottedFrame({ width, height, children }) {
  const dots = []
  const step = 22
  let i = 0
  for (let x = 14; x < width - 8; x += step) {
    dots.push([x, 8], [x, height - 8])
  }
  for (let y = 8 + step; y < height - 8; y += step) {
    dots.push([8, y], [width - 8, y])
  }
  return (
    <>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="22" fill="#FFF1E2" stroke={O} strokeWidth="3" />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill={DOT_COLORS[i++ % DOT_COLORS.length]} />
      ))}
      <rect x="16" y="16" width={width - 32} height={height - 32} rx="14" fill="#F4C0D2" stroke={O} strokeWidth="2.5" />
      <svg x="16" y="16" width={width - 32} height={height - 32} overflow="hidden">
        {children}
      </svg>
    </>
  )
}
