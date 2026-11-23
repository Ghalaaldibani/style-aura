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