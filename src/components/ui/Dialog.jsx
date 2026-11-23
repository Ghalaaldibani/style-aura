import { useEffect, useId, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal dialog (our own code, no plugin):
 * - role="dialog" + aria-modal + aria-labelledby/aria-describedby
 * - focus moves into the dialog when it opens (first button — put Cancel first)
 * - Tab / Shift+Tab are trapped inside
 * - Esc or tapping the dark backdrop closes it
 * - focus returns to the button that opened it
 * It uses `fixed`, and AppLayout makes the phone frame the containing block,
 * so on a laptop the dialog stays inside the phone frame.
 */
export default function Dialog({ open, onClose, title, description, children, actions }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descId = useId()

  // Keep the latest onClose without re-running the focus effect on every render.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const panel = panelRef.current
    const first = panel.querySelector(FOCUSABLE)
    ;(first ?? panel).focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...panel.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-[22px] font-semibold text-ink">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-2 text-base text-helper">
            {description}
          </p>
        )}
        {children}
        {actions && <div className="mt-6 flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}
