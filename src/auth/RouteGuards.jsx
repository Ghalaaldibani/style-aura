import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import FullScreenLoader from '../components/FullScreenLoader'

// Pages that need a logged-in user. Logged-out users go to /login,
// and we remember where they wanted to go (`state.from`) to send them back after login.
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Welcome / Sign Up / Log In: a logged-in user doesn't need them, send them home.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to="/home" replace />
  return <Outlet />
}
