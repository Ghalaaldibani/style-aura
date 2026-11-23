import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { BODY_SHAPES, SKIN_TONES, outfitSlots } from '../../data/avatar'
import { updateUser } from '../../lib/db'
import { useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import ChipGroup from '../../components/ui/ChipGroup'
import Button from '../../components/ui/Button'
import AvatarFigure from '../../components/art/AvatarFigure'
import FullScreenLoader from '../../components/FullScreenLoader'

export default function AvatarRoute() {
  const { profileLoading, profile } = useAuth()
  if (profileLoading) return <FullScreenLoader />
  return <AvatarEditor key={profile?.id ?? 'new'} initial={profile?.avatar} />
}

function AvatarEditor({ initial }) {
  usePageTitle('My Avatar')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const outfits = useUserCollection(user.uid, 'outfits')
  const items = useUserCollection(user.uid, 'items')
  const [skinTone, setSkinTone] = useState(initial?.skinTone ?? 'tan')
  const [bodyShape, setBodyShape] = useState(initial?.bodyShape ?? 'regular')

  // Preview the latest saved outfit on the avatar (if any).
  const latest = outfits.data[0]
  const pieces = latest ? (latest.itemIds ?? []).map((id) => items.data.find((i) => i.id === id)).filter(Boolean) : []

  function save() {
    updateUser(user.uid, { avatar: { skinTone, bodyShape } }).catch(() => toast.show({ message: 'Saving failed. Try again.' }))
    logEvent('avatar_saved', { skinTone, bodyShape })
    toast.show({ message: 'Avatar saved' })
    navigate(-1)
  }

  return (
    <section className="page-in">
      <PageHeader title="My Avatar" />
      <div className="flex h-80 items-center justify-center rounded-3xl bg-primary-light p-4">
        <AvatarFigure
          skinTone={skinTone}
          bodyShape={bodyShape}
          outfit={outfitSlots(pieces)}
          label={`Avatar preview: ${SKIN_TONES.find((s) => s.id === skinTone)?.name} skin tone, ${bodyShape} body shape${latest ? `, wearing ${latest.name}` : ''}`}
          className="h-full w-auto"
        />
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-ink">Skin tone</legend>
        <div className="flex gap-3">
          {SKIN_TONES.map((tone) => (
            <div key={tone.id}>
              <input
                id={`skin-${tone.id}`}
                type="radio"
                name="skin"
                value={tone.id}
                checked={skinTone === tone.id}
                onChange={() => setSkinTone(tone.id)}
                className="peer sr-only"
              />
              {/* Selected = thick purple ring + check mark (not colour alone — Phase 2 audit fix) */}
              <label
                htmlFor={`skin-${tone.id}`}
                title={tone.name}
                className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-ink/20 peer-checked:ring-4 peer-checked:ring-primary peer-checked:ring-offset-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary"
                style={{ background: tone.hex }}
              >
                <span className="sr-only">{tone.name}</span>
                {skinTone === tone.id && (
                  <span aria-hidden="true" className="rounded-full bg-white/90 px-1 text-sm font-bold text-primary">
                    ✓
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <ChipGroup
        legend="Body shape"
        name="body"
        options={BODY_SHAPES.map((b) => ({ value: b.id, label: b.name }))}
        value={bodyShape}
        onChange={setBodyShape}
        className="mt-5"
      />

      <Button fullWidth className="mt-6" onClick={save}>
        Save Avatar
      </Button>
    </section>
  )
}
