import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from './auth/RouteGuards'
import Welcome from './pages/Welcome'
import Placeholder from './pages/Placeholder'
import DevPlayground from './pages/DevPlayground'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Only for logged-out users */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Placeholder title="Sign Up" />} />
          <Route path="/login" element={<Placeholder title="Log In" />} />
        </Route>

        {/* Only for logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Placeholder title="Home" />} />
          <Route path="/wardrobe" element={<Placeholder title="My Wardrobe" />} />
          <Route path="/outfits" element={<Placeholder title="Outfits" />} />
          <Route path="/favorites" element={<Placeholder title="Favorites" />} />
        </Route>

        {import.meta.env.DEV && <Route path="/dev/ui" element={<DevPlayground />} />}
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  )
}
