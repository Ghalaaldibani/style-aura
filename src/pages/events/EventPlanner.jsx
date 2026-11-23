import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { useSimplifiedUI } from '../../adaptive/useSimplifiedUI'
import { EVENT_TYPES } from '../../data/categories'
import { addUserDoc } from '../../lib/db'
import { planEvent } from '../../lib/stylist'
import { useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import ChipGroup from '../../components/ui/ChipGroup'
import Button from '../../components/ui/Button'
import SuggestionResult from '../outfits/SuggestionResult'
import { snapshotPieces } from '../outfits/useOutfitPieces'

const todayISO = () => new Date().toISOString().slice(0, 10)

const VALIDATORS = {
  name: (value) => (!value?.trim() ? 'Give your event a name.' : value.trim().length > 40 ? 'Keep it under 40 characters.' : ''),
  date: (value) => (!value ? 'Choose the date of the event.' : value < todayISO() ? 'The date can’t be in the past.' : ''),
  type: (value) => (value ? '' : 'Choose the type of event.'),
}
const HINTS = {
  name: 'Example: “Noura’s wedding” or “Graduation day”.',
  date: 'Use the calendar button in the field to pick today or a future date.',
  type: 'Pick the closest match. It sets how formal the outfit should be.',
}

export default function EventPlanner() {
  usePageTitle('Event Planner')
  const { user, profile } = useAuth()
  const { logEvent, announce } = useAdaptive()
  const toast = useToast()
  const items = useUserCollection(user.uid, 'items')
  const events = useUserCollection(user.uid, 'events')
  const tracker = useFieldErrorTracker({ screen: 'event-planner', validators: VALIDATORS, hints: HINTS })
  const { attachForm } = tracker
  const simple = useSimplifiedUI({ screen: 'event-planner', idleMs: 25000, errorThreshold: 2 })
  const { attach: attachSensor } = simple
  const [type, setType] = useState('')
  const [plan, setPlan] = useState(null)
  const [saved, setSaved] = useState(false)

  const style = profile?.style ?? null

  function build(e) {
    e.preventDefault()
    const { ok, values } = tracker.validate()
    if (!ok) {
      simple.registerError()
      return
    }
    const eventType = EVENT_TYPES.find((t) => t.id === values.type)
    const result = planEvent(items.data, { style, formality: eventType.formality })
    setPlan({ ...result, values, eventType })
    setSaved(false)
    logEvent('event_planned', { type: values.type, owned: result.owned.length, missing: result.missing })
    announce(`${result.owned.length} pieces from your wardrobe, ${result.missing.length} missing.`)
  }

  async function save() {
    const { values, owned, missing, eventType, reasons } = plan
    try {
      let outfitId = null
      if (owned.length) {
        const ref = await addUserDoc(user.uid, 'outfits', {
          name: values.name.trim(),
          itemIds: owned.map((p) => p.id),
          pieces: snapshotPieces(owned),
          source: 'event',
          reasons,
          style,
        })
        outfitId = ref.id
      }
      await addUserDoc(user.uid, 'events', {
        name: values.name.trim(),
        date: values.date,
        type: eventType.id,
        notes: values.notes ?? '',
        outfitId,
        missing,
      })
      setSaved(true)
      simple.markDone()
      toast.show({ message: 'Event saved' })
      logEvent('event_saved', { type: eventType.id })
    } catch {
      toast.show({ message: 'Saving failed. Check your connection.' })
    }
  }

  const upcoming = events.data.filter((ev) => ev.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <section ref={attachSensor} className="page-in">
      <PageHeader title="Event Planner" backTo="/wardrobe" />

      {simple.simplified && (
        <div role="status" className="mb-4 rounded-2xl border border-rose/40 bg-rose-light p-3 text-sm text-ink">
          <p>
            <span aria-hidden="true">✨ </span>
            Just three things: a name, a date and the type. We’ll do the rest.
          </p>
          <button type="button" onClick={simple.restore} className="mt-1 min-h-11 font-semibold text-primary underline">
            Show more options
          </button>
        </div>
      )}

      <form ref={attachForm} onSubmit={build} noValidate className="flex flex-col gap-5">
        <Input label="Event name" placeholder="e.g. Graduation day" maxLength={40} {...tracker.fieldProps('name')} />
        <Input label="Date" type="date" min={todayISO()} {...tracker.fieldProps('date')} />
        <ChipGroup
          legend="Event type"
          name="type"
          size="sm"
          options={EVENT_TYPES.map((t) => ({ value: t.id, label: t.name }))}
          value={type}
          onChange={setType}
          error={tracker.errors.type}
          adaptiveHint={tracker.fieldProps('type').adaptiveHint}
        />
        {!simple.simplified && (
          <Input label="Notes (optional)" multiline name="notes" placeholder="Dress code, colours to avoid…" maxLength={200} />
        )}
        <Button type="submit" fullWidth size={simple.simplified ? 'lg' : 'md'}>
          ✨ Build my outfit
        </Button>
      </form>

      {plan && (
        <div className="mt-6 flex flex-col gap-4" aria-live="polite">
          <h2 className="text-h3 font-semibold text-ink">
            Your outfit for {plan.values.name.trim()} · {plan.eventType.name}
          </h2>
          {plan.owned.length > 0 ? (
            <p className="text-sm font-medium text-success">✓ {plan.owned.length} pieces you already own</p>
          ) : (
            <p className="text-sm text-helper">Nothing in your wardrobe fits this event yet.</p>
          )}
          <SuggestionResult pieces={plan.owned} reasons={plan.reasons} missing={plan.missing} style={style} formality={plan.eventType.formality} />
          {saved ? (
            <p role="status" className="rounded-xl bg-white p-3 text-center font-semibold text-success">
              ✓ Saved to your events
            </p>
          ) : (
            <Button fullWidth onClick={save}>
              Save event
            </Button>
          )}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-8">
          <h2 className="text-h3 font-semibold text-ink">Upcoming events</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {upcoming.map((ev) => (
              <li key={ev.id} className="rounded-2xl border border-line bg-white p-3">
                <p className="font-semibold text-ink">{ev.name}</p>
                <p className="text-sm text-muted">
                  {new Date(`${ev.date}T00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                  {EVENT_TYPES.find((t) => t.id === ev.type)?.name}
                  {ev.missing?.length ? ` · missing ${ev.missing.length}` : ''}
                </p>
                {ev.outfitId && (
                  <Link to={`/outfits/${ev.outfitId}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">
                    View outfit
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
