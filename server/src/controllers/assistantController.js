import { answerQuestion } from '../utils/assistantEngine.js'

export async function askAssistant(req, res) {
  const { question, history } = req.body

  if (!question || !question.trim()) {
    res.status(400)
    throw new Error('Question is required.')
  }

  const answer = await answerQuestion(question, req.user, Array.isArray(history) ? history : [])

  res.json({
    question: question.trim(),
    answer,
  })
}