import GarmentArt from '../components/art/GarmentArt'
import AvatarFigure from '../components/art/AvatarFigure'
import { AllStylesScene, OneStyleScene } from '../components/art/StyleScene'

// Dev-only gallery to review the hand-made SVG illustrations.
const KINDS = ['tshirt', 'babytee', 'sweater', 'hoodie', 'shirt', 'jeans', 'trousers', 'cargo', 'skirt', 'shorts', 'dress', 'blazer', 'jacket', 'coat', 'sneakers', 'boots', 'loafers', 'heels', 'cap', 'beanie', 'bag', 'necklace', 'sunglasses', 'belt', 'sock', 'heart']
const COLORS = ['black', 'pink', 'olive', 'camel', 'blue', 'purple', 'cream', 'burgundy']

export default function DevArt() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h2 font-bold">Art gallery</h1>
      <AllStylesScene />
      <div className="grid grid-cols-2 gap-2">
        {['emo', 'y2k', 'oldmoney', 'streetwear'].map((s) => (
          <OneStyleScene key={s} style={s} />
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {KINDS.map((k, i) => (
          <div key={k} className="aspect-square rounded bg-white p-1">
            <GarmentArt kind={k} color={COLORS[i % COLORS.length]} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="h-48 rounded bg-primary-light"><AvatarFigure skinTone="light" bodyShape="slim" /></div>
        <div className="h-48 rounded bg-primary-light"><AvatarFigure skinTone="medium" bodyShape="regular" outfit={{ top: { color: 'pink' }, bottom: { color: 'purple', kind: 'skirt' }, shoes: { color: 'white' } }} /></div>
        <div className="h-48 rounded bg-primary-light"><AvatarFigure skinTone="tan" bodyShape="curvy" outfit={{ dress: { color: 'navy' }, shoes: { color: 'black' }, outerwear: { color: 'camel' } }} /></div>
        <div className="h-48 rounded bg-primary-light"><AvatarFigure skinTone="deep" bodyShape="regular" outfit={{ top: { color: 'black' }, bottom: { color: 'black' }, shoes: { color: 'black' }, outerwear: { color: 'burgundy' } }} /></div>
      </div>
    </div>
  )
}
