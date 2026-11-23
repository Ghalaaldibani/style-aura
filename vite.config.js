import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Matches "/" or "\" so it works on Windows and on Vercel (Linux).
const SEP = String.raw`[/\\]`
const firebaseRe = new RegExp(`node_modules${SEP}(@firebase|firebase)${SEP}`)
const reactRe = new RegExp(`node_modules${SEP}(react|react-dom|react-router|react-router-dom|scheduler)${SEP}`)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Put big libraries in their own files so the browser can cache them between deploys.
        codeSplitting: {
          groups: [
            { name: 'firebase', test: firebaseRe },
            { name: 'react', test: reactRe },
          ],
        },
      },
    },
    // Firebase Auth + Firestore alone is ~650 kB minified (≈195 kB gzipped); that is expected.
    chunkSizeWarningLimit: 700,
  },
})
