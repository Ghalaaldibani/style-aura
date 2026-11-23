import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import ContrastBanner from './ContrastBanner'
import ToastProvider from './ui/ToastProvider'
import FullScreenLoader from './FullScreenLoader'

const NAV_ROUTES = ['/home', '/wardrobe', '/outfits', '/favorites']

export default function AppLayout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  // On every page change: scroll to top and move focus to <main>, so keyboard and
  // screen-reader users start at the new page's content (not at the old link).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const main = mainRef.current
    if (!main) return
    main.scrollTop = 0
    main.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="min-h-dvh md:flex md:items-center md:justify-center md:bg-primary-light md:py-8">
      <a
        href="#main"
        className="sr-only z-[60] rounded-xl bg-primary px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      {/*
        Phone frame. `[contain:layout]` makes this frame the containing block for
        `position: fixed` children, so dialogs and toasts stay inside the phone on a laptop.
      */}
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas [contain:layout] md:h-[844px] md:w-[390px] md:rounded-[48px] md:border-[10px] md:border-ink md:shadow-2xl">
        <ToastProvider raised={showNav}>
          <div className="safe-top">
            <ContrastBanner />
          </div>
          <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 overflow-y-auto px-6 pt-10 pb-8 outline-none focus-visible:outline-none">
            <Suspense fallback={<FullScreenLoader />}>
              <Outlet />
            </Suspense>
          </main>
          {showNav && (
            <div className="safe-bottom">
              <BottomNav />
            </div>
          )}
        </ToastProvider>
      </div>
    </div>
  )
}
