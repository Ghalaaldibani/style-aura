import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { useSimplifiedUI } from '../../adaptive/useSimplifiedUI'
import { CATEGORIES, KINDS, OCCASIONS, SEASONS } from '../../data/categories'
import { COLORS, COLOR_IDS } from '../../data/colors'
import { STYLES, STYLE_IDS } from '../../data/styles'
import { addUserDoc, updateUserDoc } from '../../lib/db'
import { compressImage } from '../../lib/imageCompress'
import { useLiveDoc } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import * as v from '../../lib/validators'
import { useToast } from '../../components/ui/ToastContext'
import Input from '../../components/ui/Input'
import ChipGroup from '../../components/ui/ChipGroup'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import ItemImage from '../../components/art/ItemImage'
import FullScreenLoader from '../../components/FullScreenLoader'
import { ErrorState } from '../../components/ui/States'

const VALIDATORS = {
  name: v.lengthBetween('Name', 2, 30),
  category: (value) => (value ? '' : 'Choose a category.'),
  color: (value) => (value ? '' : 'Choose the main colour.'),
}
const HINTS = {
  name: 'Example: “Black hoodie” or “Blue jeans”. 2–30 characters.',
  category: 'Pick the group it belongs to, e.g. a T-shirt is a Top and sneakers are Shoes.',
  color: 'Choose the colour you see most. If it has many colours, pick the main one.',
}

// Route wrapper: edit mode waits for the item, then mounts the form with its values.
export default function AddItemRoute() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, error } = useLiveDoc(id ? ['users', user.uid, 'items', id] : [null])
  if (!id) return <ItemForm key="new" />
  if (loading) return <FullScreenLoader />
  if (error || !data) return <ErrorState message="This item could not be found." />
  return <ItemForm key={id} existing={data} />
}

function ItemForm({ existing }) {
  const editing = Boolean(existing)
  usePageTitle(editing ? 'Edit item' : 'Add clothing item')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const tracker = useFieldErrorTracker({ screen: 'add-item', validators: VALIDATORS, hints: HINTS })
  const { attachForm } = tracker
  // Cognitive-load sensor: hesitation (20 s idle) or 2 failed saves → hide optional fields.
  const simple = useSimplifiedUI({ screen: 'add-item', idleMs: 20000, errorThreshold: 2 })
  const { attach: attachSensor } = simple

  const [category, setCategory] = useState(existing?.category ?? '')
  const [kind, setKind] = useState(existing?.kind ?? '')
  const [color, setColor] = useState(existing?.color ?? '')
  const [image, setImage] = useState(existing?.image ?? null)
  const [photoError, setPhotoError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const cameraRef = useRef(null)
  const fileRef = useRef(null)

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const effectiveKind = kind && KINDS[category]?.some((k) => k.id === kind) ? kind : CATEGORIES.find((c) => c.id === category)?.kind
  const preview = { image, kind: effectiveKind ?? 'tshirt', color: color || 'grey', name: 'Item preview' }

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError('')
    setProcessing(true)
    try {
      const dataUrl = await compressImage(file)
      setImage(dataUrl)
      setDirty(true)
      logEvent('photo_added', { kb: Math.round((dataUrl.length * 0.75) / 1024) })
    } catch (err) {
      setPhotoError(err.message)
      simple.registerError()
    }
    setProcessing(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const { ok, values } = tracker.validate()
    if (!ok) {
      simple.registerError()
      return
    }
    const data = {
      name: values.name.trim(),
      category: values.category,
      kind: effectiveKind,
      color: values.color,
      season: values.season ?? existing?.season ?? 'all',
      formality: Number(values.formality ?? existing?.formality ?? 1),
      tags: simple.simplified ? existing?.tags ?? [] : new FormData(e.currentTarget).getAll('tags'),
      image: image ?? null,
    }
    const write = editing ? updateUserDoc(user.uid, 'items', existing.id, data) : addUserDoc(user.uid, 'items', data)
    write.catch(() => toast.show({ message: 'Saving failed. Check your connection and try again.' }))
    simple.markDone()
    logEvent(editing ? 'item_edited' : 'item_added', { category: data.category, simplified: simple.simplified })
    toast.show({ message: editing ? 'Item updated' : `${data.name} saved to your wardrobe` })
    navigate(editing ? `/wardrobe/${existing.id}` : '/wardrobe', { replace: true })
  }

  function leave() {
    if (dirty) setConfirmDiscard(true)
    else navigate(-1)
  }

  return (
    <section ref={attachSensor} className="page-in">
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={leave}
          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-white px-4 text-sm font-semibold text-primary hover:border-primary"
        >
          <span aria-hidden="true">‹</span> Back
        </button>
        <h1 className="text-h2 font-bold text-ink">{editing ? 'Edit item' : 'Add clothing item'}</h1>
      </header>

      <div className="mx-auto flex h-44 w-44 items-center justify-center" aria-hidden="true">
        <ItemImage item={preview} />
      </div>
      {image && (
        <p className="text-center">
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-primary underline"
            onClick={() => {
              setImage(null)
              setDirty(true)
            }}
          >
            Remove photo
          </button>
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => cameraRef.current?.click()} loading={processing}>
          Take Photo
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={processing}>
          Upload
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} tabIndex={-1} aria-hidden="true" />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} tabIndex={-1} aria-hidden="true" />
      <p className="mt-2 text-xs text-helper">No photo? We’ll draw it for you from the category and colour.</p>
      {photoError && (
        <p role="alert" className="mt-2 text-sm font-medium text-error">
          ⚠ {photoError}
        </p>
      )}

      {simple.simplified && (
        <div role="status" className="mt-4 rounded-2xl border border-rose/40 bg-rose-light p-3 text-sm text-ink">
          <p>
            <span aria-hidden="true">✨ </span>
            Let’s keep it simple: just a name, a category and a colour. You can add details later.
          </p>
          <button type="button" onClick={simple.restore} className="mt-1 min-h-11 font-semibold text-primary underline">
            Show more options
          </button>
        </div>
      )}

      <form
        ref={attachForm}
        onSubmit={handleSubmit}
        onInput={() => setDirty(true)}
        noValidate
        className="mt-4 flex flex-col gap-5"
      >
        <Input label="Name" placeholder="e.g. Black hoodie" defaultValue={existing?.name} maxLength={30} {...tracker.fieldProps('name')} />

        <ChipGroup
          legend="Category"
          name="category"
          size="sm"
          options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
          value={category}
          onChange={(val) => {
            setCategory(val)
            setDirty(true)
          }}
          error={tracker.errors.category}
          adaptiveHint={tracker.fieldProps('category').adaptiveHint}
        />

        <ChipGroup
          legend="Main colour"
          name="color"
          size="sm"
          options={COLOR_IDS.map((id) => ({ value: id, label: COLORS[id].name, swatch: COLORS[id].hex }))}
          value={color}
          onChange={(val) => {
            setColor(val)
            setDirty(true)
          }}
          error={tracker.errors.color}
          adaptiveHint={tracker.fieldProps('color').adaptiveHint}
        />

        {!simple.simplified && (
          <>
            {category && KINDS[category].length > 1 && (
              <ChipGroup
                legend="Type (optional)"
                name="kind"
                size="sm"
                options={KINDS[category].map((k) => ({ value: k.id, label: k.name }))}
                value={effectiveKind}
                onChange={setKind}
              />
            )}
            <ChipGroup
              legend="Season (optional)"
              name="season"
              size="sm"
              options={SEASONS.map((s) => ({ value: s.id, label: s.name }))}
              defaultValue={existing?.season ?? 'all'}
            />
            <ChipGroup
              legend="Occasion (optional)"
              name="formality"
              size="sm"
              options={OCCASIONS.map((o) => ({ value: o.id, label: o.name }))}
              defaultValue={existing?.formality ?? 1}
            />
            <ChipGroup
              legend="Style tags (optional)"
              name="tags"
              type="checkbox"
              size="sm"
              options={STYLE_IDS.map((s) => ({ value: s, label: STYLES[s].name }))}
              defaultValue={existing?.tags ?? []}
              hint="Helps AI Suggest pick this item for the right style."
            />
          </>
        )}

        <Button type="submit" fullWidth size={simple.simplified ? 'lg' : 'md'}>
          {editing ? 'Save changes' : 'Save to Wardrobe'}
        </Button>
        <Button variant="ghost" fullWidth onClick={leave}>
          Cancel
        </Button>
      </form>

      <Dialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Discard changes?"
        description="You have unsaved changes. If you leave now, they will be lost."
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setConfirmDiscard(false)}>
              Keep editing
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                logEvent('discard_changes', { screen: 'add-item' })
                navigate(-1)
              }}
            >
              Discard
            </Button>
          </>
        }
      />
    </section>
  )
}
