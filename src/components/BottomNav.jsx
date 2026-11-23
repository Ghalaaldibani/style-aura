import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/home', label: 'Home' },
  { to: '/wardrobe', label: 'Wardrobe' },
  { to: '/outfits', label: 'Outfits' },
  { to: '/favorites', label: 'Favorites' },
]

export default function BottomNav() {
  return (
    <nav aria-label="Main navigation" className="px-4 pb-4">
      <ul className="flex justify-around bg-white border border-line rounded-3xl py-3 shadow-sm">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 min-w-16 py-1 text-xs font-medium ${isActive ? 'text-primary' : 'text-muted'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden="true" className={`w-7 h-7 rounded-full ${isActive ? 'bg-primary' : 'bg-line'}`} />
                  {tab.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}