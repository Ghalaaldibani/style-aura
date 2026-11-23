import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { useSimplifiedUI } from '../../adaptive/useSimplifiedUI'
import { CATEGORIES, SEASONS } from '../../data/categories'
import { STYLES } from '../../data/styles'
import { addUserDoc } from '../../lib/db'
import { suggestOutfit } from '../../lib/stylist'
import { useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ChipGroup from '../../components/ui/ChipGroup'
import ItemImage from '../../components/art/ItemImage'
import GarmentArt from '../../components/art/GarmentArt'
import { EmptyState, LoadingGrid } from '../../components/ui/States'
import SuggestionResult from './SuggestionResult'
import { snapshotPieces } from './useOutfitPieces'

// Simulated "thinking" time, 1.5–2.5 s, with real progress and a working Cancel.
function runStylist(signal, onProgress) {
  const duration = 1500 + Math.random() * 1000
  const start = performance.now()
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / duration)
      onProgress(Math.round(p * 100))
      if (p >= 1) {
        clearInterval(timer)
        resolve()
      }
    }, 80)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new DOMException('Cancelled', 'AbortError'))
    })
  })
}

export default function CreateOutfit() {
  usePageTitle('Create Outfit')
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { logEvent, announce } = useAdaptive()
  const toast = useToast()
  const { data: items, loading } = useUserCollection(user.uid, 'items')
  const style = profile?.style ?? null

  // Cognitive-load sensor: idle 20 s or 2 errors → hide filters and point to AI Suggest (Hick's Law).
  const simple = useSimplifiedUI({ screen: 'create-outfit', idleMs: 20000, errorThreshold: 2 })
  const { attach: attachSensor } = simple

  const [tab, setTab] = useState('ai')
  const [status, setStatus] = useState('idle') // idle | loading | done | empty
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const history = useRef([]) // last 3 suggestions, never repeated
  const controller = useRef(null)

  useEffect(() => () => controller.current?.abort(), [])

  async function suggest(isRegenerate = false) {
    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    setStatus('loading')
    setProgress(0)
    logEvent(isRegenerate ? 'regenerate' : 'ai_suggest', { style })
    try {
      await runStylist(ctrl.signal, setProgress)
      const outfit = suggestOutfit(items, { style, avoid: history.current })
      if (!outfit) {
        setStatus('empty')
        return
      }
      history.current = [outfit.pieces.map((p) => p.id), ...history.current].slice(0, 3)
      setResult(outfit)
      setStatus('done')
      announce(`Outfit ready: ${outfit.pieces.map((p) => p.name).join(', ')}.`)
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus(result ? 'done' : 'idle')
        logEvent('ai_cancel')
        announce('Styling cancelled.')
      }
    }
  }

  function saveOutfit(pieces, source, name, reasons = []) {
    const data = {
      name,
      itemIds: pieces.map((p) => p.id),
      pieces: snapshotPieces(pieces),
      source,
      reasons,
      style,
    }
    addUserDoc(user.uid, 'outfits', data)
      .then((ref) => logEvent('outfit_saved', { source, outfitId: ref.id }))
      .catch(() => toast.show({ message: 'Saving failed. Try again.' }))
    simple.markDone()
    toast.show({ message: `“${name}” saved to your outfits` })
    navigate('/outfits', { replace: true })
  }

  // The sensor's container is always rendered, so its DOM listeners attach on the first render.
  let body = null
  if (loading) body = <LoadingGrid />
  else if (items.length === 0) {
    body = (
      <EmptyState
        art={<GarmentArt kind="hoodie" color="pink" />}
        title="Add some clothes first"
        text="The stylist builds outfits from your own wardrobe."
        action={<Button to="/wardrobe">Go to my wardrobe</Button>}
      />
    )
  }

  return (
    <section ref={attachSensor} className="page-in">
      <PageHeader title="Create Outfit" backTo="/outfits" />
      {body ?? (
        <>
      {simple.simplified && (
        <div role="status" className="mb-4 rounded-2xl border border-rose/40 bg-rose-light p-3 text-sm text-ink">
          <p>
            <span aria-hidden="true">✨ </span>
            Not sure where to start? Let <strong>AI Suggest</strong> build an outfit for you in one tap.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tab !== 'ai' && (
              <Button size="sm" onClick={() => setTab('ai')}>
                Use AI Suggest
              </Button>
            )}
            <button type="button" onClick={simple.restore} className="min-h-11 px-2 font-semibold text-primary underline">
              Show more options
            </button>
          </div>
        </div>
      )}

      <Tabs
        label="How do you want to create your outfit?"
        tabs={[
          { id: 'ai', label: 'AI Suggest' },
          { id: 'manual', label: 'Create Manually' },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t)
          logEvent('tab_change', { tab: t })
        }}
      >
        {tab === 'ai' ? (
          <AiPanel
            status={status}
            progress={progress}
            result={result}
            style={style}
            simplified={simple.simplified}
            onSuggest={() => suggest(false)}
            onRegenerate={() => suggest(true)}
            onCancel={() => controller.current?.abort()}
            onSave={(name) => saveOutfit(result.pieces, 'ai', name, result.reasons)}
          />
        ) : (
          <ManualPanel
            items={items}
            simplified={simple.simplified}
            onError={simple.registerError}
            onSave={(pieces, name) => saveOutfit(pieces, 'manual', name)}
          />
        )}
      </Tabs>
        </>
      )}
    </section>
  )
}

function AiPanel({ status, progress, result, style, simplified, onSuggest, onRegenerate, onCancel, onSave }) {
  const [name, setName] = useState(`${style ? STYLES[style].name : 'My'} look`)

  if (status === 'loading') {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 text-center" aria-busy="true">
        <p id="styling-label" className="text-h3 font-semibold text-ink">
          Styling your outfit…
        </p>
        <div
          role="progressbar"
          aria-labelledby="styling-label"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-helper">{progress}% · matching colours, season and your style</p>
        <Button variant="secondary" className="mt-4" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    )
  }

  if (status === 'done' && result) {
    return (
      <div className="flex flex-col gap-4">
        <SuggestionResult pieces={result.pieces} reasons={result.reasons} missing={result.missing} style={style} />
        <Input label="Outfit name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        <Button fullWidth disabled={!name.trim()} onClick={() => onSave(name.trim())}>
          Save outfit
        </Button>
        <Button variant="secondary" fullWidth onClick={onRegenerate}>
          ↻ Regenerate
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-base text-ink">
        Our stylist picks a top, bottom and shoes from <strong>your own wardrobe</strong>, matching{' '}
        {style ? <strong>{STYLES[style].name}</strong> : 'your items'}, the season and colours that go together.
      </p>
      {status === 'empty' && (
        <p role="alert" className="mt-3 text-sm font-medium text-error">
          ⚠ We couldn’t build an outfit. Add a top, a bottom and shoes to your wardrobe.
        </p>
      )}
      <Button fullWidth size={simplified ? 'lg' : 'md'} className="mt-4" onClick={onSuggest}>
        ✨ Style my outfit
      </Button>
    </div>
  )
}

function ManualPanel({ items, simplified, onError, onSave }) {
  const [category, setCategory] = useState('all')
  const [season, setSeason] = useState('any')
  const [selected, setSelected] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const filtered = items.filter(
    (i) =>
      (simplified || category === 'all' || i.category === category) &&
      (simplified || season === 'any' || i.season === season || i.season === 'all')
  )

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    setError('')
  }

  function save() {
    if (selected.length < 2) {
      setError('Pick at least 2 pieces for an outfit.')
      onError()
      return
    }
    if (!name.trim()) {
      setError('Give your outfit a name.')
      onError()
      return
    }
    onSave(
      selected.map((id) => items.find((i) => i.id === id)),
      name.trim()
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {!simplified && (
        <div className="flex flex-col gap-3">
          <ChipGroup
            legend="Filter by category"
            name="manual-cat"
            size="sm"
            options={[{ value: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]}
            value={category}
            onChange={setCategory}
          />
          <ChipGroup
            legend="Season"
            name="manual-season"
            size="sm"
            options={[{ value: 'any', label: 'Any' }, ...SEASONS.filter((s) => s.id !== 'all').map((s) => ({ value: s.id, label: s.name }))]}
            value={season}
            onChange={setSeason}
          />
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">
          Choose pieces <span className="font-normal text-helper">({selected.length} selected)</span>
        </legend>
        {filtered.length === 0 ? (
          <p className="text-sm text-helper">No items match these filters.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {filtered.map((item) => {
              const on = selected.includes(item.id)
              return (
                <li key={item.id}>
                  <label
                    className={`relative flex h-full cursor-pointer flex-col items-center rounded-xl border bg-white p-2 text-center has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary ${
                      on ? 'border-2 border-primary' : 'border-line'
                    }`}
                  >
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(item.id)} />
                    <span className="h-14 w-14">
                      <ItemImage item={item} />
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs font-medium text-ink">{item.name}</span>
                    {on && (
                      <span aria-hidden="true" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                        ✓
                      </span>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </fieldset>

      <Input label="Outfit name" placeholder="e.g. Friday brunch" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
      {error && (
        <p role="alert" className="text-sm font-medium text-error">
          ⚠ {error}
        </p>
      )}
      <Button fullWidth onClick={save}>
        Save outfit
      </Button>
    </div>
  )
}
