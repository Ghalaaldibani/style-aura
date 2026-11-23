import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import ContrastBanner from './ContrastBanner'
import ToastProvider from './ui/ToastProvider'

const NAV_ROUTES = ['/home', '/wardrobe', '/outfits', '/favorites']

export default function AppLayout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)

  return (
    <div className="min-h-dvh md:flex md:items-center md:justify-center md:bg-primary-light md:py-8">
      {/*
        Phone frame. `[contain:layout]` makes this frame the containing block for
        `position: fixed` children, so dialogs and toasts stay inside the phone on a laptop.
      */}
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas [contain:layout] md:h-[844px] md:w-[390px] md:rounded-[48px] md:border-[10px] md:border-ink md:shadow-2xl">
        <ToastProvider raised={showNav}>
          <ContrastBanner />
          <main className="flex-1 overflow-y-auto px-6 pt-12 pb-6">
            <Outlet />
          </main>
          {showNav && <BottomNav />}
        </ToastProvider>
      </div>
    </div>
  )
}
