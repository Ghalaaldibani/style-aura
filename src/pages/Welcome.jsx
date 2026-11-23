import { Link } from 'react-router-dom'

const STYLES = ['Emo', 'Y2K', 'Old Money', 'Streetwear', 'And more…']

export default function Welcome() {
  return (
    <>
      {/* Soft gradient blobs from the Figma design */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[38px]">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rose/40 blur-3xl" />
      </div>

      <section className="relative z-10 min-h-full flex flex-col items-center text-center">
        <img src="/logo.png" alt="Style Aura logo" className="w-40 h-40 mt-6 rounded-full object-cover" />

        <h1 className="mt-6 text-[40px] font-bold text-primary">StyleAura</h1>
        <p className="mt-3 text-lg text-helper max-w-60">Your digital closet with a built-in stylist</p>

                <ul aria-label="Style types" className="mt-10 w-full flex flex-wrap justify-center gap-2.5">
          {STYLES.map((style) => (
            <li key={style} className="px-3 py-1 rounded-full bg-primary-light text-primary-dark text-sm font-medium">
              {style}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-helper">Take a 10-question quiz to find yours</p>

        <div className="mt-auto w-full flex flex-col gap-3 pt-8">
          <Link to="/signup" className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold">
            Get Started
          </Link>
          <Link to="/login" className="w-full py-4 rounded-2xl bg-primary-light border border-primary text-primary font-semibold">
            Log In
          </Link>
          <p className="text-xs text-muted">By continuing, you agree to our Terms &amp; Privacy Policy</p>
        </div>
      </section>
    </>
  )
}