// Quiz answers are kept in sessionStorage while the user moves between questions.
const KEY = 'styleaura-quiz'

export function loadAnswers() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveAnswer(index, optionIndex) {
  const answers = loadAnswers()
  answers[index] = optionIndex
  try {
    sessionStorage.setItem(KEY, JSON.stringify(answers))
  } catch {
    /* storage blocked: answers stay in memory only */
  }
  return answers
}

export function clearAnswers() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
