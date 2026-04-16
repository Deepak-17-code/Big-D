import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bot, LoaderCircle, Send, Sparkles, WandSparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Card from '../components/common/Card'
import { assistantService } from '../services/assistantService'

const exampleQuestions = [
  'How many calories should I eat to lose weight?',
  'What is BMI and how is it calculated?',
  'How many steps do I need to burn 300 calories?',
  'What is the best workout split for muscle gain?',
]

const smartPrompts = [
  {
    label: 'Use my stats',
    prompt: 'Based on my stats, give me my calories for fat loss and a simple daily plan.'
  },
  {
    label: 'Workout split',
    prompt: 'Suggest the best weekly workout split for muscle gain and explain why.'
  },
  {
    label: 'Meal plan',
    prompt: 'Create a simple high-protein meal plan for fat loss.'
  },
  {
    label: 'Step goal',
    prompt: 'How many steps should I aim for daily to support fat loss?'
  },
]

export default function AIAssistantPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [syncingHistory, setSyncingHistory] = useState(false)
  const [savedAnswers, setSavedAnswers] = useState([])
  const [loadingSavedAnswers, setLoadingSavedAnswers] = useState(false)
  const [savingAnswerId, setSavingAnswerId] = useState('')
  const [error, setError] = useState('')

  const queryQuestion = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') || ''
  }, [location.search])

  useEffect(() => {
    if (queryQuestion) {
      setQuestion(queryQuestion)
      void submitQuestion(queryQuestion)
      navigate('/assistant', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryQuestion])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await assistantService.getHistory()
        const history = Array.isArray(data?.history) ? data.history : []
        setMessages(history)
      } catch {
        // Keep the chat usable even if server history is unavailable.
      } finally {
        setHistoryLoaded(true)
      }
    }

    const loadSavedAnswers = async () => {
      try {
        setLoadingSavedAnswers(true)
        const { data } = await assistantService.getSavedAnswers()
        const answers = Array.isArray(data?.savedAnswers) ? data.savedAnswers : []
        setSavedAnswers(answers)
      } catch {
        // Saved answers are optional.
      } finally {
        setLoadingSavedAnswers(false)
      }
    }

    loadHistory()
    loadSavedAnswers()
  }, [])

  const markdownComponents = {
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-7 text-slate-100">{children}</p>,
    h1: ({ children }) => <h1 className="mb-3 text-xl font-bold text-white">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-3 text-lg font-semibold text-white">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 text-base font-semibold text-white">{children}</h3>,
    ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 text-slate-100">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 text-slate-100">{children}</ol>,
    li: ({ children }) => <li className="leading-7 text-slate-100">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-slate-100">{children}</em>,
    code: ({ children, className }) =>
      className ? (
        <code className="rounded bg-slate-950 px-1.5 py-0.5 text-[0.85em] text-blue-200">{children}</code>
      ) : (
        <code className="rounded bg-slate-950 px-1.5 py-0.5 text-[0.85em] text-blue-200">{children}</code>
      ),
    pre: ({ children }) => (
      <pre className="mb-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-3 border-l-4 border-blue-500/50 pl-4 italic text-slate-200">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer" className="text-blue-300 underline decoration-blue-400/60 underline-offset-4">
        {children}
      </a>
    ),
  }

  const submitQuestion = async (value = question) => {
    const cleanedQuestion = value.trim()
    if (!cleanedQuestion) {
      setError('Ask any question and I will answer it.')
      return
    }

    setError('')
    setLoading(true)

    const priorMessages = messages
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
      .slice(-12)
      .map((item) => ({ role: item.role, content: item.content }))

    setMessages((current) => [
      ...current,
      { role: 'user', content: cleanedQuestion },
    ])

    try {
      const { data } = await assistantService.ask(cleanedQuestion, priorMessages)

      const nextMessages = [
        ...priorMessages,
        { role: 'user', content: cleanedQuestion },
        { role: 'assistant', content: data.answer || 'I could not generate an answer right now.' },
      ]

      setMessages(nextMessages)

      if (historyLoaded) {
        setSyncingHistory(true)
        try {
          await assistantService.saveHistory(nextMessages)
        } catch {
          // Keep the session functional if persistence fails.
        } finally {
          setSyncingHistory(false)
        }
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The assistant could not answer that right now.')
    } finally {
      setLoading(false)
    }
  }

  const buildSavedTitle = (questionText) => {
    const compact = questionText.trim().replace(/\s+/g, ' ')
    return compact.length > 60 ? `${compact.slice(0, 57)}...` : compact
  }

  const saveAssistantAnswer = async (index) => {
    const answerMessage = messages[index]
    const questionMessage = messages[index - 1]

    if (!answerMessage || answerMessage.role !== 'assistant') {
      return
    }

    const questionText = questionMessage?.role === 'user' ? questionMessage.content : 'Saved answer'
    const payload = {
      title: buildSavedTitle(questionText),
      question: questionText,
      answer: answerMessage.content,
    }

    const answerKey = `${questionText}::${answerMessage.content}`

    try {
      setSavingAnswerId(answerKey)
      const { data } = await assistantService.saveAnswer(payload)
      const answers = Array.isArray(data?.savedAnswers) ? data.savedAnswers : []
      setSavedAnswers(answers)
    } catch {
      setError('Could not save this answer right now.')
    } finally {
      setSavingAnswerId('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await submitQuestion(question)
    setQuestion('')
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-800/80 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-blue-950/30">
        <div className="flex items-start justify-between gap-6 max-md:flex-col">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-blue-300/80">AI Assistant</p>
            <h1 className="text-3xl font-black text-white md:text-4xl">Ask anything, get a useful answer</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Use this assistant for fitness, nutrition, productivity, study help, definitions, or general questions.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-blue-100">
            <Sparkles size={18} />
            <div>
              <p className="text-sm font-semibold">Smart answer mode</p>
              <p className="text-xs text-blue-100/70">LLM if available, otherwise instant-answer fallback</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="flex gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
            <WandSparkles size={18} className="mt-1 shrink-0 text-blue-300" />
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask any question..."
              rows={3}
              className="min-h-21 flex-1 resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
              Ask AI
            </button>
            <button
              type="button"
              onClick={() => {
                setQuestion('')
                setMessages([])
                void assistantService.clearHistory().catch(() => {})
              }}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Clear Chat
            </button>
          </div>
        </form>

        {syncingHistory && (
          <p className="mt-3 text-xs text-slate-400">Saving chat to your account...</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {exampleQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuestion(item)}
              className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500/50 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">Quick prompts</p>
          <div className="flex flex-wrap gap-2">
            {smartPrompts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setQuestion(item.prompt)}
                className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-200 transition hover:border-blue-500/50 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card title="Conversation" subtitle="Your recent questions and answers" className="p-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
              Start by asking a question. For example: “What should I eat after a workout?”
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`w-full max-w-full rounded-2xl border px-3 py-3 text-sm leading-6 whitespace-pre-wrap wrap-break-word sm:px-4 md:max-w-3xl ${
                    message.role === 'user'
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-50'
                      : 'border-slate-700 bg-slate-900/70 text-slate-100'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                    {message.role === 'user' ? 'You' : 'BigD AI'}
                    {message.role === 'assistant' && <Bot size={12} />}
                  </div>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap leading-7 text-blue-50">{message.content}</p>
                  )}

                  {message.role === 'assistant' && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveAssistantAnswer(index)}
                        disabled={savingAnswerId === `${messages[index - 1]?.content || 'Saved answer'}::${message.content}`}
                        className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingAnswerId === `${messages[index - 1]?.content || 'Saved answer'}::${message.content}`
                          ? 'Saving...'
                          : 'Save answer'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                <LoaderCircle size={16} className="animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Saved Answers" subtitle="Useful replies you can come back to later" className="p-6">
        {loadingSavedAnswers ? (
          <div className="text-sm text-slate-400">Loading saved answers...</div>
        ) : savedAnswers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
            Save an answer from the conversation to keep it here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedAnswers.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved answer</p>
                    <h3 className="mt-1 text-sm font-semibold text-white">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { data } = await assistantService.deleteSavedAnswer(item._id)
                        setSavedAnswers(Array.isArray(data?.savedAnswers) ? data.savedAnswers : [])
                      } catch {
                        setError('Could not remove the saved answer right now.')
                      }
                    }}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
                <p className="mb-3 text-xs text-slate-400">Q: {item.question}</p>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {item.answer}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}