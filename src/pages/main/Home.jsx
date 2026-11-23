import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { sendEmailVerification } from 'firebase/auth'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { BOARDS, getProduct } from '../../data/catalog'
import { STYLES, STYLE_IDS } from '../../data/styles'
import { usePageTitle } from '../../lib/usePageTitle'
import OutfitCollage from '../../components/art/OutfitCollage'
import ChipGroup from '../../components/ui/ChipGroup'
import FullScreenLoader from '../../components/FullScreenLoader'
import { iconButtonClass } from '../../components/ui/PageHeader'

function VerifyBanner({ user }) {
  const [sent, setSent] = useState(false)
  if (user.emailVerified) return null
  return (
    <div className="mb-4 rounded-2xl border border-info/40 bg-white p-3 text-sm">
      <p className="text-ink">Please verify your email. We sent a link to {user.email}.</p>
      <button
        type="button"
        disabled={sent}
        onClick={() => {
          sendEmailVerification(user).catch(() => {})
          setSent(true)
        }}
        className="mt-1 min-h-11 font-semibold text-primary underline disabled:no-underline disabled:opacity-70"
      >
        {sent ? 'Sent! Check your inbox' : 'Resend link'}
      </button>
    </div>
  )
}

export default function Home() {
  usePageTitle('Outfits for you')
  const { user, profile, profileLoading } = useAuth()
  const { logEvent } = useAdaptive()
  const myStyle = profile?.style ?? null
  const [filter, setFilter] = useState(null) // null = the user's own style (adaptive default)

  if (profileLoading) return <FullScreenLoader />
  // New users go to the quiz first (unless they skipped it).
  if (!profile || (!profile.style && !profile.quizSkipped)) return <Navigate to="/quiz" replace />

  const active = filter ?? myStyle ?? 'all'
  const boards = active === 'all' ? BOARDS : BOARDS.filter((b) => b.style === active)
  const options = [
    ...(myStyle ? [{ value: myStyle, label: `For you · ${STYLES[myStyle].name}` }] : []),
    ...STYLE_IDS.filter((s) => s !== myStyle).map((s) => ({ value: s, label: STYLES[s].name })),
    { value: 'all', label: 'All' },
  ]
  const initial = (profile.name ?? user.displayName ?? '?').trim().charAt(0).toUpperCase()

  return (
    <section className="page-in">
      <header className="mb-4 flex items-center gap-2">
        <h1 className="flex-1 text-h2 font-bold text-ink">Outfits for you</h1>
        <Link to="/feed" className={iconButtonClass} aria-label="Friends feed">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
            <circle cx="17" cy="9" r="2.8" />
            <path d="M16 14.2c3 0 5.5 2 5.5 5" />
          </svg>
        </Link>
        <Link
          to="/profile"
          aria-label="Profile and settings"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-bold text-white"
        >
          <span aria-hidden="true">{initial}</span>
        </Link>
      </header>

      <VerifyBanner user={user} />

      {!myStyle && (
        <div className="mb-4 rounded-2xl border border-line bg-white p-4">
          <p className="text-sm text-ink">Take the 10-question quiz and we’ll pick outfit boards for your style.</p>
          <Link to="/quiz" className="mt-1 inline-flex min-h-11 items-center font-semibold text-primary underline">
            Take the quiz
          </Link>
        </div>
      )}

      <ChipGroup
        legend="Show boards for"
        name="board-style"
        size="sm"
        options={options}
        value={active}
        onChange={(v) => {
          setFilter(v)
          logEvent('board_filter', { style: v })
        }}
        className="mb-4 [&_legend]:sr-only"
      />

      <ul className="grid grid-cols-2 gap-4">
        {boards.map((board) => {
          const items = board.productIds.map(getProduct)
          return (
            <li key={board.id}>
              <Link
                to={`/board/${board.id}`}
                className="block h-full rounded-2xl border border-line bg-white p-3 shadow-sm hover:border-primary"
              >
                <OutfitCollage items={items} />
                <p className="mt-2 font-semibold text-ink">{board.title}</p>
                <p className="text-sm text-muted">
                  {STYLES[board.style].name} · {items.length} items
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-sm text-helper">Tap an outfit to see its pieces and where to buy.</p>
      {myStyle && (
        <Link to="/quiz" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">
          Retake the style quiz
        </Link>
      )}
    </section>
  )
}
