import { useAuth } from '../auth/AuthContext'
import { usePageTitle } from '../lib/usePageTitle'
import Button from '../components/ui/Button'
import GarmentArt from '../components/art/GarmentArt'

export default function NotFound() {
  usePageTitle('Page not found')
  const { user } = useAuth()
  return (
    <section className="page-in flex min-h-full flex-col items-center justify-center text-center">
      <div className="h-32 w-32">
        <GarmentArt kind="sock" color="pink" />
      </div>
      <h1 className="mt-4 text-h1 font-bold text-ink">This page is missing</h1>
      <p className="mt-2 text-base text-helper">Like a lost sock, we couldn’t find it. Let’s get you back.</p>
      <Button to={user ? '/home' : '/'} fullWidth className="mt-6">
        {user ? 'Go to Home' : 'Go to start'}
      </Button>
    </section>
  )
}
