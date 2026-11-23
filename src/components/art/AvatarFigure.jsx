import { colorHex } from '../../data/colors'
import { SKIN_TONES, BODY_SHAPES } from '../../data/avatar'

const O = '#2A2430'

// Two-layer stroke = outlined limb.
function Limb({ d, color }) {
  return (
    <>
      <path d={d} fill="none" stroke={O} strokeWidth="11" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
    </>
  )
}

/**
 * Full-body avatar drawn in SVG layers.
 * `outfit` = { top, bottom, dress, outerwear, shoes } — each an item ({kind, color}) or undefined.
 */
export default function AvatarFigure({ skinTone = 'tan', bodyShape = 'regular', outfit = {}, label, className = 'h-full w-full' }) {
  const skin = SKIN_TONES.find((s) => s.id === skinTone)?.hex ?? SKIN_TONES[2].hex
  const h = BODY_SHAPES.find((b) => b.id === bodyShape)?.hip ?? 4
  const top = outfit.top ? colorHex(outfit.top.color) : '#FBF5E6'
  const bottomItem = outfit.bottom
  const bottom = bottomItem ? colorHex(bottomItem.color) : '#5B84C9'
  const shoes = outfit.shoes ? colorHex(outfit.shoes.color) : '#FFFFFF'
  const dress = outfit.dress ? colorHex(outfit.dress.color) : null
  const outer = outfit.outerwear ? colorHex(outfit.outerwear.color) : null
  const isSkirt = bottomItem?.kind === 'skirt' || bottomItem?.kind === 'shorts'

  return (
    <svg viewBox="0 0 120 240" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <g stroke={O} strokeWidth="2" strokeLinejoin="round">
        <ellipse cx="60" cy="230" rx="34" ry="5" fill="#2A2430" opacity="0.15" stroke="none" />
        {/* back hair */}
        <path d="M38 42 Q38 14 60 14 Q82 14 82 42 L84 84 L36 84 Z" fill="#6B4226" />

        {/* legs */}
        <Limb d="M52 150 L51 214" color={skin} />
        <Limb d="M68 150 L69 214" color={skin} />

        {/* arms */}
        <Limb d="M40 86 L31 128" color={skin} />
        <Limb d="M80 86 L89 128" color={skin} />

        {/* bottom / dress */}
        {dress ? (
          <path d={`M42 80 L78 80 L${86 + h} 182 L${34 - h} 182 Z`} fill={dress} />
        ) : isSkirt ? (
          <path d={`M${40 - h / 2} 128 L${80 + h / 2} 128 L${88 + h} 172 L${32 - h} 172 Z`} fill={bottom} />
        ) : (
          <path d={`M${40 - h / 2} 126 L${80 + h / 2} 126 L${77 + h / 3} 214 L63 214 L60 152 L57 214 L${43 - h / 3} 214 Z`} fill={bottom} />
        )}

        {/* top (hidden under a dress) */}
        {!dress && (
          <>
            <path d={`M41 80 Q60 74 79 80 L${81 + h / 3} 130 L${39 - h / 3} 130 Z`} fill={top} />
            <path d="M41 80 L32 102 L40 106 L45 92 Z" fill={top} />
            <path d="M79 80 L88 102 L80 106 L75 92 Z" fill={top} />
          </>
        )}

        {/* open jacket */}
        {outer && (
          <>
            <path d={`M41 80 L52 80 L54 ${dress ? 150 : 136} L${38 - h / 3} ${dress ? 150 : 136} Z`} fill={outer} />
            <path d={`M79 80 L68 80 L66 ${dress ? 150 : 136} L${82 + h / 3} ${dress ? 150 : 136} Z`} fill={outer} />
            <path d="M41 80 L31 118 L39 121 L46 94 Z" fill={outer} />
            <path d="M79 80 L89 118 L81 121 L74 94 Z" fill={outer} />
          </>
        )}

        {/* shoes */}
        <path d="M42 212 L58 212 L60 222 L40 222 Z" fill={shoes} />
        <path d="M62 212 L78 212 L80 222 L60 222 Z" fill={shoes} />

        {/* neck + head */}
        <rect x="55" y="62" width="10" height="16" fill={skin} />
        <circle cx="60" cy="46" r="18" fill={skin} />
        <circle cx="53" cy="47" r="1.8" fill={O} stroke="none" />
        <circle cx="67" cy="47" r="1.8" fill={O} stroke="none" />
        <circle cx="49" cy="53" r="2.6" fill="#EE8FA6" stroke="none" />
        <circle cx="71" cy="53" r="2.6" fill="#EE8FA6" stroke="none" />
        <path d="M56 55 Q60 58 64 55" fill="none" />
        <path d="M42 44 Q44 26 60 27 Q76 28 78 44 Q70 34 60 36 Q50 34 42 44 Z" fill="#6B4226" />
        <circle cx="42" cy="54" r="3" fill="none" stroke="#E0A526" strokeWidth="2" />
        <circle cx="78" cy="54" r="3" fill="none" stroke="#E0A526" strokeWidth="2" />
      </g>
    </svg>
  )
}
