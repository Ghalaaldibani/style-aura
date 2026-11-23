import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdaptiveProvider from './adaptive/AdaptiveProvider.jsx'
import AuthProvider from './auth/AuthProvider.jsx'

// AuthProvider is outside AdaptiveProvider so the adaptive logs can later be saved under the user's uid.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdaptiveProvider>
          <App />
        </AdaptiveProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
// Installable app + offline shell (production only, so it never caches the dev server).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
