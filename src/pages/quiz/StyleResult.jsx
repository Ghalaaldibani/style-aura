import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { STYLES } from '../../data/styles'
import { usePageTitle } from '../../lib/usePageTitle'
import { OneStyleScene } from '../../components/art/StyleScene'
import Button from '../../components/ui/Button'
import FullScreenLoader from '../../components/FullScreenLoader'

export default function StyleResult() {
  usePageTitle('Your style')
  const { profile, profileLoading } = useAuth()
  const location = useLocation()
  const styleId = profile?.style ?? location.state?.style

  if (!styleId && profileLoading) return <FullScreenLoader />
  if (!styleId) return <Navigate to="/quiz" replace />

  const style = STYLES[styleId]
  return (
    <section className="page-in">
      <p className="text-h2 font-bold text-ink">Your style</p>
      <div className="mt-5">
        <OneStyleScene style={styleId} label={`A character dressed in ${style.name} style`} />
      </div>
      <h1 className="mt-5 text-[2.125rem] font-bold leading-tight text-primary">{style.name}</h1>
      <p className="mt-2 text-base text-muted">{style.description}</p>
      <div className="mt-6 flex flex-col gap-4">
        <Button fullWidth to="/home">
          View Outfits
        </Button>
        <Button variant="secondary" fullWidth to="/avatar">
          Customize my avatar
        </Button>
      </div>
    </section>
  )
}
