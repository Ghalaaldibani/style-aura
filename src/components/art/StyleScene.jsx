import StyleCharacter, { DottedFrame } from './StyleCharacter'
import GarmentArt from './GarmentArt'

const ORDER = ['emo', 'y2k', 'oldmoney', 'streetwear']

// Quiz intro: the four style characters side by side.
export function AllStylesScene({ label = 'Four characters dressed in Emo, Y2K, Old Money and Streetwear styles' }) {
  return (
    <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={label}>
      <DottedFrame width={320} height={210}>
        <circle cx="34" cy="40" r="26" fill="#F7DC8A" />
        <circle cx="262" cy="46" r="20" fill="#C9A5E3" />
        <path d="M230 30 Q252 18 278 28" fill="none" stroke="#3FA796" strokeWidth="3" />
        {ORDER.map((style, i) => (
          <g key={style} transform={`translate(${6 + i * 70} 26) scale(0.82)`}>
            <StyleCharacter style={style} />
          </g>
        ))}
      </DottedFrame>
    </svg>
  )
}

const PROPS = {
  emo: [{ kind: 'boots', color: 'black' }, { kind: 'necklace', color: 'silver' }],
  y2k: [{ kind: 'sneakers', color: 'pink' }, { kind: 'sunglasses', color: 'pink' }],
  oldmoney: [{ kind: 'loafers', color: 'brown' }, { kind: 'bag', color: 'camel' }],
  streetwear: [{ kind: 'sneakers', color: 'white' }, { kind: 'bag', color: 'purple' }],
}

// Style result: one character with two matching items.
export function OneStyleScene({ style, label }) {
  const [left, right] = PROPS[style] ?? PROPS.streetwear
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={label}>
      <DottedFrame width={320} height={200}>
        <circle cx="44" cy="38" r="26" fill="#F7DC8A" />
        <circle cx="256" cy="40" r="22" fill="#C9A5E3" />
        <path d="M196 22 Q222 10 250 22" fill="none" stroke="#3FA796" strokeWidth="3" />
        <path d="M30 70 L34 80 L44 80 L36 86 L39 96 L30 90 L21 96 L24 86 L16 80 L26 80 Z" fill="#F2C94C" stroke="#2A2430" strokeWidth="1.5" />
        <svg x="10" y="90" width="80" height="80">
          <GarmentArt kind={left.kind} color={left.color} />
        </svg>
        <svg x="200" y="80" width="80" height="80">
          <GarmentArt kind={right.kind} color={right.color} />
        </svg>
        <g transform="translate(94 20) scale(1.05)">
          <StyleCharacter style={style} />
        </g>
      </DottedFrame>
    </svg>
  )
}
