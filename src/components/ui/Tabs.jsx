import { useId, useRef } from 'react'

/**
 * Accessible tabs (WAI-ARIA Tabs pattern, our own code):
 * - role="tablist" / "tab" / "tabpanel", aria-selected, aria-controls
 * - only the selected tab is in the Tab order; Arrow Left/Right, Home, End move between tabs
 * - the selected tab is shown with a white pill + bold text, not colour alone
 * `children` is the content of the selected tab.
 */
export default function Tabs({ label, tabs, value, onChange, children }) {
  const baseId = useId()
  const tabRefs = useRef([])
  const panelId = `${baseId}-panel`

  function handleKeyDown(e, index) {
    const last = tabs.length - 1
    let next = null
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    onChange(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 rounded-2xl bg-primary-light p-1">
        {tabs.map((tab, i) => {
          const selected = tab.id === value
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={selected ? panelId : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={[
                'min-h-11 flex-1 rounded-xl px-3 text-sm transition-colors',
                selected ? 'bg-white font-semibold text-primary shadow-sm' : 'font-medium text-muted hover:text-ink',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={`${baseId}-tab-${value}`} tabIndex={0} className="mt-4">
        {children}
      </div>
    </div>
  )
}
