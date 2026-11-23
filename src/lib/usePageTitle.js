import { useEffect } from 'react'

// Updates the browser tab title for each screen (WCAG 2.4.2 Page Titled).
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Style Aura` : 'Style Aura'
  }, [title])
}
