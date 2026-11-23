import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { serverTimestamp } from 'firebase/firestore'
import { QUESTIONS, QUIZ_LENGTH, scoreQuiz } from '../../data/quiz'
import { colorHex } from '../../data/colors'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { useDwellTime } from '../../adaptive/useDwellTime'
import { savePublicProfile, updateUser } from '../../lib/db'
import { usePageTitle } from '../../lib/usePageTitle'
import GarmentArt from '../../components/art/GarmentArt'
import Button from '../../components/ui/Button'
import { clearAnswers, loadAnswers, saveAnswer } from './quizStorage'

const HESITATION_MS = 15000

function OptionArt({ option }) {
  if (option.swatches) {
    return (
      <span className="grid h-12 w-12 shrink-0 grid-cols-3 gap-0.5 overflow-hidden rounded-xl bg-primary-light p-1.5" aria-hidden="true">
        {option.swatches.map((c) => (
          <span key={c} className="rounded-full border border-ink/20" style={{ background: colorHex(c) }} />
        ))}
      </span>
    )
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light p-1">
      <GarmentArt kind={option.art.kind} color={option.art.color} />
    </span>
  )
}

// Wrapper: a new key per question resets the component state and the dwell-time sensor.
export default function QuizQuestionRoute() {
  const { n } = useParams()
  const index = Number(n) - 1
  if (!Number.isInteger(index) || index < 0 || index >= QUIZ_LENGTH) return <Navigate to="/quiz" replace />
  return <QuizQuestion key={index} index={index} />
}

function QuizQuestion({ index }) {
  usePageTitle(`Question ${index + 1} of ${QUIZ_LENGTH}`)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { logEvent } = useAdaptive()
  const question = QUESTIONS[index]
  const [selected, setSelected] = useState(() => loadAnswers()[index] ?? null)

  // Dwell-time sensor: > 15 s on this question without answering → hesitation → show help.
  const { hesitating, complete } = useDwellTime({ taskKey: `quiz-q${index + 1}`, thresholdMs: HESITATION_MS })

  function next() {
    if (selected === null) return
    complete({ question: index + 1, answer: question.options[selected].style })
    const answers = saveAnswer(index, selected)

    if (index + 1 < QUIZ_LENGTH) {
      navigate(`/quiz/${index + 2}`)
      return
    }
    const { style, scores } = scoreQuiz(answers)
    updateUser(user.uid, { style, styleScores: scores, quizSkipped: false, quizCompletedAt: serverTimestamp() }).catch((err) =>
      console.error(err)
    )
    savePublicProfile(user.uid, { style })
    logEvent('quiz_completed', { style, scores })
    clearAnswers()
    navigate('/result', { replace: true, state: { style } })
  }

  const progress = ((index + 1) / QUIZ_LENGTH) * 100

  return (
    <section className="page-in">
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(index === 0 ? '/quiz' : `/quiz/${index}`)}
          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-white px-4 text-sm font-semibold text-primary hover:border-primary"
        >
          <span aria-hidden="true">‹</span> Back
        </button>
        <p className="text-h2 font-bold text-ink">Style Quiz</p>
      </header>

      <p id="quiz-progress-label" className="text-sm text-muted">
        Question {index + 1} of {QUIZ_LENGTH}
      </p>
      <div
        role="progressbar"
        aria-labelledby="quiz-progress-label"
        aria-valuemin={1}
        aria-valuemax={QUIZ_LENGTH}
        aria-valuenow={index + 1}
        className="mt-2 h-1.5 w-full rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <fieldset className="mt-4">
        <legend>
          <h1 className="text-[1.375rem] font-bold leading-snug text-ink">{question.text}</h1>
        </legend>

        {hesitating && (
          <p role="status" className="mt-3 rounded-xl border border-info/40 bg-white p-3 text-sm text-ink">
            <span aria-hidden="true">🤔 </span>
            Take your time. There’s no wrong answer. We added a short description to each option to help you choose.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {question.options.map((option, i) => {
            const id = `q${index}-opt${i}`
            const isSelected = selected === i
            return (
              <div key={option.label}>
                <input
                  id={id}
                  type="radio"
                  name={`q${index}`}
                  value={i}
                  checked={isSelected}
                  onChange={() => setSelected(i)}
                  className="peer sr-only"
                  aria-describedby={hesitating ? `${id}-help` : undefined}
                />
                <label
                  htmlFor={id}
                  className={[
                    'flex min-h-[5rem] cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition-colors',
                    'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                    isSelected ? 'border-2 border-primary' : 'border-line hover:border-primary',
                  ].join(' ')}
                >
                  <OptionArt option={option} />
                  <span className="flex-1">
                    <span className="block text-base text-ink">{option.label}</span>
                    {hesitating && (
                      <span id={`${id}-help`} className="mt-0.5 block text-sm text-helper">
                        {option.help}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-white">
                      ✓
                    </span>
                  )}
                </label>
              </div>
            )
          })}
        </div>
      </fieldset>

      <Button fullWidth className="mt-5" disabled={selected === null} onClick={next} aria-describedby="next-help">
        {index + 1 === QUIZ_LENGTH ? 'See my style' : 'Next'}
      </Button>
      <p id="next-help" className="mt-2 text-center text-xs text-helper">
        {selected === null ? 'Choose an option to continue.' : ' '}
      </p>
    </section>
  )
}
