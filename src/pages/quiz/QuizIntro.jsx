import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { updateUser } from '../../lib/db'
import { usePageTitle } from '../../lib/usePageTitle'
import { AllStylesScene } from '../../components/art/StyleScene'
import Button from '../../components/ui/Button'
import { clearAnswers } from './quizStorage'

export default function QuizIntro() {
  usePageTitle('Discover your style')
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { logEvent } = useAdaptive()

  function start() {
    clearAnswers()
    logEvent('quiz_started')
    navigate('/quiz/1')
  }

  // FR3: the quiz can be skipped.
  function skip() {
    updateUser(user.uid, { quizSkipped: true }).catch(() => {})
    logEvent('quiz_skipped')
    navigate('/wardrobe')
  }

  return (
    <section className="page-in">
      <h1 className="text-h2 font-bold text-ink">Discover your style</h1>
      <div className="mt-5">
        <AllStylesScene />
      </div>
      <p className="mt-5 text-base text-muted">10 quick visual questions · about 3 minutes</p>
      <p className="mt-3 text-sm text-helper">Find out if you are Emo, Y2K, Old Money or Streetwear.</p>

      <div className="mt-6 flex flex-col gap-4">
        <Button fullWidth onClick={start}>
          {profile?.style ? 'Retake Quiz' : 'Start Quiz'}
        </Button>
        {profile?.style ? (
          <Button variant="secondary" fullWidth to="/home">
            Keep my current style
          </Button>
        ) : (
          <Button variant="secondary" fullWidth onClick={skip}>
            Skip quiz — go to my wardrobe
          </Button>
        )}
      </div>
    </section>
  )
}
