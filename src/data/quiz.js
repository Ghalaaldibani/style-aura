// 10 visual questions. Every option scores 1 point for one style.
// `art` = garment illustration, or `swatches` = colour chips.
// `help` = short description shown when the dwell-time sensor detects hesitation.
export const QUESTIONS = [
  {
    text: 'Which look feels most like you?',
    options: [
      { style: 'streetwear', label: 'Oversized hoodie & sneakers', art: { kind: 'sneakers', color: 'grey' }, help: 'Comfy, sporty, relaxed fit' },
      { style: 'oldmoney', label: 'Tailored blazer & loafers', art: { kind: 'coat', color: 'camel' }, help: 'Polished, classic, neutral colours' },
      { style: 'y2k', label: 'Baby tee & low-rise jeans', art: { kind: 'jeans', color: 'blue' }, help: 'Playful 2000s throwback' },
      { style: 'emo', label: 'All-black with boots', art: { kind: 'heart', color: 'black' }, help: 'Dark, edgy, layered' },
    ],
  },
  {
    text: 'Pick your go-to shoes',
    options: [
      { style: 'emo', label: 'Combat boots', art: { kind: 'boots', color: 'black' }, help: 'Chunky, tough and dark' },
      { style: 'y2k', label: 'Platform sneakers', art: { kind: 'sneakers', color: 'pink' }, help: 'Tall, bright and fun' },
      { style: 'streetwear', label: 'Chunky trainers', art: { kind: 'sneakers', color: 'white' }, help: 'Bold everyday sneakers' },
      { style: 'oldmoney', label: 'Leather loafers', art: { kind: 'loafers', color: 'brown' }, help: 'Smart, timeless leather' },
    ],
  },
  {
    text: 'Which colours do you reach for?',
    options: [
      { style: 'oldmoney', label: 'Cream, beige & navy', swatches: ['cream', 'beige', 'navy'], help: 'Soft neutrals that look expensive' },
      { style: 'emo', label: 'Black, burgundy & silver', swatches: ['black', 'burgundy', 'silver'], help: 'Deep, moody tones' },
      { style: 'streetwear', label: 'Olive, black & orange', swatches: ['olive', 'black', 'orange'], help: 'Earthy colours with one pop' },
      { style: 'y2k', label: 'Pink, purple & silver', swatches: ['pink', 'purple', 'silver'], help: 'Sweet, shiny and bright' },
    ],
  },
  {
    text: 'Your favourite bag?',
    options: [
      { style: 'y2k', label: 'Mini shoulder bag', art: { kind: 'bag', color: 'silver' }, help: 'Small, shiny, worn under the arm' },
      { style: 'streetwear', label: 'Crossbody bag', art: { kind: 'bag', color: 'black' }, help: 'Hands-free and practical' },
      { style: 'oldmoney', label: 'Structured leather bag', art: { kind: 'bag', color: 'camel' }, help: 'Clean lines, quality leather' },
      { style: 'emo', label: 'Chain-strap bag', art: { kind: 'bag', color: 'burgundy' }, help: 'Dark with metal details' },
    ],
  },
  {
    text: 'Pick a weekend outfit',
    options: [
      { style: 'streetwear', label: 'Cargo pants & graphic tee', art: { kind: 'cargo', color: 'olive' }, help: 'Loose, pocketed, easy' },
      { style: 'emo', label: 'Ripped jeans & band tee', art: { kind: 'tshirt', color: 'black' }, help: 'Music-inspired and dark' },
      { style: 'oldmoney', label: 'Cable-knit sweater & trousers', art: { kind: 'sweater', color: 'cream' }, help: 'Cosy but refined' },
      { style: 'y2k', label: 'Mini skirt & baby tee', art: { kind: 'skirt', color: 'purple' }, help: 'Cute and colourful' },
    ],
  },
  {
    text: 'Which accessory would you add?',
    options: [
      { style: 'oldmoney', label: 'Pearl necklace', art: { kind: 'necklace', color: 'white' }, help: 'Delicate and classic' },
      { style: 'y2k', label: 'Tinted sunglasses', art: { kind: 'sunglasses', color: 'pink' }, help: 'Coloured lenses, very 2000s' },
      { style: 'emo', label: 'Studded belt', art: { kind: 'belt', color: 'black' }, help: 'Metal studs, rock vibe' },
      { style: 'streetwear', label: 'Baseball cap', art: { kind: 'cap', color: 'green' }, help: 'Sporty everyday cap' },
    ],
  },
  {
    text: 'Pick a jacket',
    options: [
      { style: 'emo', label: 'Leather jacket', art: { kind: 'jacket', color: 'black' }, help: 'Classic rock layer' },
      { style: 'oldmoney', label: 'Trench coat', art: { kind: 'coat', color: 'beige' }, help: 'Long, belted, timeless' },
      { style: 'streetwear', label: 'Puffer jacket', art: { kind: 'jacket', color: 'olive' }, help: 'Warm, oversized, sporty' },
      { style: 'y2k', label: 'Cropped cardigan', art: { kind: 'sweater', color: 'pink' }, help: 'Short, soft and cute' },
    ],
  },
  {
    text: 'What music matches your mood?',
    options: [
      { style: 'y2k', label: '2000s pop', swatches: ['pink', 'yellow', 'purple'], help: 'Catchy, upbeat throwbacks' },
      { style: 'streetwear', label: 'Hip-hop & R&B', swatches: ['black', 'orange', 'olive'], help: 'Beats and street culture' },
      { style: 'emo', label: 'Rock & alternative', swatches: ['black', 'red', 'grey'], help: 'Guitars and big feelings' },
      { style: 'oldmoney', label: 'Jazz & classical', swatches: ['navy', 'cream', 'camel'], help: 'Calm and sophisticated' },
    ],
  },
  {
    text: 'Your ideal hangout spot?',
    options: [
      { style: 'oldmoney', label: 'Brunch at a quiet café', swatches: ['cream', 'camel', 'white'], help: 'Slow, elegant mornings' },
      { style: 'emo', label: 'Record store or concert', swatches: ['black', 'burgundy', 'purple'], help: 'Music and late nights' },
      { style: 'y2k', label: 'Mall & photo booth', swatches: ['pink', 'silver', 'blue'], help: 'Shopping and selfies' },
      { style: 'streetwear', label: 'Skate park with friends', swatches: ['grey', 'olive', 'orange'], help: 'Outdoors and active' },
    ],
  },
  {
    text: 'Pick a word for your vibe',
    options: [
      { style: 'streetwear', label: 'Bold & relaxed', swatches: ['olive', 'white', 'black'], help: 'Confident without trying' },
      { style: 'y2k', label: 'Fun & playful', swatches: ['pink', 'purple', 'yellow'], help: 'Bright and cheerful' },
      { style: 'oldmoney', label: 'Elegant & timeless', swatches: ['beige', 'navy', 'cream'], help: 'Classy and calm' },
      { style: 'emo', label: 'Dark & expressive', swatches: ['black', 'burgundy', 'silver'], help: 'Deep and emotional' },
    ],
  },
]

export const QUIZ_LENGTH = QUESTIONS.length

// answers = array of option indexes. Returns { style, scores }.
export function scoreQuiz(answers) {
  const scores = { streetwear: 0, y2k: 0, oldmoney: 0, emo: 0 }
  answers.forEach((optionIndex, q) => {
    const option = QUESTIONS[q]?.options[optionIndex]
    if (option) scores[option.style] += 1
  })
  // Highest score wins; ties go to the style chosen in the most recent answers.
  let best = null
  for (let q = answers.length - 1; q >= 0; q--) {
    const s = QUESTIONS[q]?.options[answers[q]]?.style
    if (s && (best === null || scores[s] > scores[best])) best = s
  }
  return { style: best ?? 'streetwear', scores }
}
