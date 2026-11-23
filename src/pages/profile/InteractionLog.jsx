import { limit, orderBy, query } from 'firebase/firestore'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { userCol } from '../../lib/db'
import { useLiveQuery } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import PageHeader from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/States'

const LABELS = {
  input_error: 'Input error',
  hint_shown: 'Hint shown',
  hesitation: 'Hesitation detected',
  dwell_time: 'Time on question',
  ui_simplified: 'Screen simplified',
  ui_restored: 'More options restored',
  auto_contrast_on: 'Auto high contrast ON',
  auto_contrast_undo: 'Auto contrast undone',
  auto_contrast_kept: 'Auto contrast kept',
  manual_contrast_toggle: 'Contrast toggled',
  ai_suggest: 'AI Suggest',
  ai_cancel: 'AI cancelled',
  regenerate: 'Regenerate',
  error_fixed: 'Error fixed',
  task_time: 'Form completed',
}

const ADAPTIVE = new Set(['hint_shown', 'hesitation', 'ui_simplified', 'auto_contrast_on'])

function describe(e) {
  const parts = []
  if (e.field) parts.push(`field: ${e.field}`)
  if (e.details?.task) parts.push(e.details.task)
  if (e.durationMs != null) parts.push(`${(e.durationMs / 1000).toFixed(1)} s`)
  if (e.count != null) parts.push(`count ${e.count}`)
  if (e.details?.reason) parts.push(`reason: ${e.details.reason}`)
  if (e.details?.style) parts.push(e.details.style)
  return parts.join(' · ')
}

// Proves the live-database bonus: every sensor event is stored in Firestore and listed here.
export default function InteractionLog() {
  usePageTitle('My interaction log')
  const { user } = useAuth()
  const { logs, sessionId } = useAdaptive()
  const saved = useLiveQuery(`logs-${user.uid}`, () => query(userCol(user.uid, 'interactionLogs'), orderBy('timestamp', 'desc'), limit(100)))

  const counts = logs.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }), {})
  const adaptiveCount = Object.entries(counts)
    .filter(([t]) => ADAPTIVE.has(t))
    .reduce((s, [, n]) => s + n, 0)

  return (
    <div className="page-in">
      <PageHeader title="My interaction log" backTo="/profile" />
      <p className="text-sm text-helper">
        Style Aura’s sensors record how you use the app (errors, hesitation, time on task) to adapt the interface. Stored in your
        private Firestore space.
      </p>

      <section className="mt-4 grid grid-cols-3 gap-2 text-center" aria-label="This session">
        <div className="rounded-2xl border border-line bg-white p-3">
          <p className="text-h2 font-bold text-primary">{logs.length}</p>
          <p className="text-xs text-muted">events this session</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-3">
          <p className="text-h2 font-bold text-primary">{counts.input_error ?? 0}</p>
          <p className="text-xs text-muted">errors</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-3">
          <p className="text-h2 font-bold text-primary">{adaptiveCount}</p>
          <p className="text-xs text-muted">adaptations</p>
        </div>
      </section>

      <h2 className="mt-6 text-h3 font-semibold text-ink">Saved in the database</h2>
      {saved.error ? (
        <ErrorState message="Couldn’t load the saved log." />
      ) : saved.loading ? (
        <LoadingGrid count={2} />
      ) : saved.data.length === 0 ? (
        <EmptyState title="Nothing saved yet" text="Use the app for a moment. Events are saved every few seconds." />
      ) : (
        <ol className="mt-2 flex flex-col gap-2">
          {saved.data.map((e) => (
            <li key={e.id} className={`rounded-xl border bg-white p-3 text-sm ${ADAPTIVE.has(e.type) ? 'border-rose' : 'border-line'}`}>
              <div className="flex items-baseline justify-between gap-2">
                <strong className="text-ink">
                  {ADAPTIVE.has(e.type) && <span aria-hidden="true">✨ </span>}
                  {LABELS[e.type] ?? e.type.replaceAll('_', ' ')}
                </strong>
                <time className="shrink-0 text-xs text-muted" dateTime={new Date(e.timestamp).toISOString()}>
                  {new Date(e.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>
              </div>
              <p className="text-xs text-helper">
                {e.screen}
                {describe(e) && ` · ${describe(e)}`}
                {e.sessionId === sessionId && ' · this session'}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
