function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function profileText(user) {
  return JSON.stringify({
    weight: user?.weight || null,
    height: user?.height || null,
    goalWeight: user?.goalWeight || null,
    goalTimelineWeeks: user?.goalTimelineWeeks || null,
  })
}

function answerStyleInstructions() {
  return [
    'Answer in a concise, helpful format.',
    'Start with a direct answer in 1-2 sentences.',
    'Use short bullet points for action steps when useful.',
    'If the user has a weight/goal profile, use it to give a best-effort estimate instead of asking extra questions.',
    'Only ask a follow-up if the answer would otherwise be misleading or unsafe.',
    'Prefer practical guidance over generic explanation.',
  ].join(' ')
}

function estimateCaloriesFromWeight(weight, goalWeight) {
  if (!weight) {
    return null
  }

  const maintenance = Math.round(weight * 30)

  if (!goalWeight || goalWeight === weight) {
    return {
      maintenance,
      target: maintenance,
      recommendation: `A reasonable starting point is about ${maintenance} calories/day for maintenance. If you want fat loss, start 300-500 calories below that.`,
    }
  }

  const target = goalWeight < weight ? Math.max(1200, maintenance - 500) : maintenance + 300
  const direction = goalWeight < weight ? 'fat loss' : 'weight gain'

  return {
    maintenance,
    target,
    recommendation: `Based on your current weight of ${weight} kg and goal of ${goalWeight} kg, a good starting estimate is about ${target} calories/day for ${direction}. Maintenance is roughly ${maintenance} calories/day.`,
  }
}

function shouldForceFitnessAnswer(question, user) {
  const text = question.toLowerCase()
  if (!/calorie|calories|weight loss|lose weight|fat loss|cut|bulk|gain/.test(text)) {
    return false
  }

  return Boolean(user?.weight)
}

function postProcessAssistantAnswer(question, user, answer) {
  const text = question.toLowerCase()
  const isCalorieQuestion = /calorie|calories|weight loss|lose weight|fat loss|cut|bulk|gain/.test(text)
  const isGenericFollowUp = /need one more piece of information|more information|need more info|one more piece|tell me your height|share your height|activity level/.test(answer.toLowerCase())

  if (isCalorieQuestion && isGenericFollowUp && user?.weight) {
    const estimate = estimateCaloriesFromWeight(user.weight, user?.goalWeight)
    if (estimate?.recommendation) {
      return estimate.recommendation
    }
  }

  if (isCalorieQuestion && user?.weight && user?.goalWeight && answer.length < 220) {
    const estimate = estimateCaloriesFromWeight(user.weight, user.goalWeight)
    if (estimate?.recommendation) {
      return estimate.recommendation
    }
  }

  return answer
}

function sanitizeHistory(history = []) {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter((entry) => entry && (entry.role === 'user' || entry.role === 'assistant'))
    .map((entry) => ({
      role: entry.role,
      content: cleanText(String(entry.content || '')),
    }))
    .filter((entry) => entry.content)
    .slice(-12)
}

function buildWorkoutAnswer(question, user) {
  const text = question.toLowerCase()
  const weight = user?.weight || null
  const height = user?.height || null
  const goalWeight = user?.goalWeight || null

  if (/\bbmi\b|body mass index/.test(text) && weight && height) {
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1)
    return `Your BMI is about ${bmi}. If you want, I can also explain what that means and what calorie target fits your goal.`
  }

  if (/calorie|calories|deficit|surplus/.test(text) && !/step|steps|walk|walking/.test(text)) {
    if (weight && height && goalWeight) {
      const direction = goalWeight < weight ? 'deficit' : 'surplus'
      return `Based on your profile, the practical approach is a ${direction} of about 300-500 calories per day, adjusted to your weekly progress. Keep protein high, train consistently, and reassess every 2 weeks.`
    }

    if (weight && goalWeight) {
      const estimate = estimateCaloriesFromWeight(weight, goalWeight)
      if (estimate?.recommendation) {
        return `${estimate.recommendation} If you want, I can also refine this with your height and activity level.`
      }
    }

    return 'A practical calorie approach is to estimate maintenance calories, then use a 300-500 calorie deficit for fat loss or a 200-300 calorie surplus for muscle gain.'
  }

  if (/step|steps|walk|walking/.test(text)) {
    const caloriesMatch = text.match(/(\d+(?:\.\d+)?)\s*(kcal|calories|calorie)/)
    if (caloriesMatch) {
      const calories = Number(caloriesMatch[1])
      if (Number.isFinite(calories) && calories > 0) {
        // Most people burn around 0.04-0.06 kcal per step depending on body weight and pace.
        const conservativeSteps = Math.round(calories / 0.04)
        const aggressiveSteps = Math.round(calories / 0.06)
        const midpoint = Math.round(calories / 0.05)

        return `A practical estimate for burning about ${Math.round(calories)} calories is roughly ${aggressiveSteps.toLocaleString()}-${conservativeSteps.toLocaleString()} steps (around ${midpoint.toLocaleString()} steps for many people). Actual burn depends on your body weight, pace, and terrain.`
      }
    }

    return 'For fat loss, a strong everyday target is 7,000-10,000 steps. If you want faster progress, combine steps with a calorie target and strength training.'
  }

  if (/muscle|gain|bulk|strength/.test(text)) {
    return 'For muscle gain, lift with progressive overload, eat enough protein, keep a small calorie surplus, and sleep 7-9 hours per night.'
  }

  if (/lose weight|fat loss|cut/.test(text)) {
    return 'For weight loss, keep a moderate calorie deficit, prioritize protein, use strength training, and stay consistent with daily movement.'
  }

  if (/sleep|recovery|rest/.test(text)) {
    return 'Most people progress best with 7-9 hours of sleep, regular rest days, hydration, and enough protein to recover from training.'
  }

  if (/protein|macro|macros/.test(text)) {
    return 'A simple protein target is 1.6-2.2 g per kg of body weight daily. Split the rest of your calories across carbs and fats based on preference and training volume.'
  }

  return [
    `Here is the best practical answer I can give for: ${cleanText(question)}`,
    '',
    'Quick plan:',
    '- Start with the goal and the constraints.',
    '- Break it into smaller weekly actions.',
    '- Track results and adjust every 1-2 weeks.',
    '- If you want, I can make it fitness, nutrition, or productivity focused.',
  ].join('\n')
}

async function getDuckDuckGoAnswer(question) {
  const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(question)}&format=json&no_html=1&skip_disambig=1&t=bigd`, {
    headers: {
      'User-Agent': 'BigD/1.0',
    },
  })

  if (!response.ok) {
    throw new Error('DuckDuckGo lookup failed.')
  }

  const data = await response.json()
  const heading = cleanText(data.Heading || '')
  const abstract = cleanText(data.AbstractText || '')
  const answer = cleanText(data.Answer || '')

  if (answer) {
    return answer
  }

  if (abstract) {
    return heading ? `${heading}: ${abstract}` : abstract
  }

  const related = Array.isArray(data.RelatedTopics)
    ? data.RelatedTopics
        .flatMap((topic) => (topic?.Topics ? topic.Topics : [topic]))
        .filter(Boolean)
        .map((topic) => cleanText(topic.Text || ''))
        .filter(Boolean)
        .slice(0, 3)
    : []

  if (related.length > 0) {
    return `${heading || 'Here are a few useful results'}:\n- ${related.join('\n- ')}`
  }

  return ''
}

async function askOpenAI(question, user, historyMessages) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { answer: '', error: '' }
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are BigD AI Assistant. ${answerStyleInstructions()} If the user asks for health or fitness advice, give practical guidance and avoid unsafe claims. If the question is about calories or weight loss, provide a best-effort estimate using the available profile even if some details are missing. Use prior conversation context when relevant.`,
      },
      {
        role: 'system',
        content: `User profile: ${profileText(user)}`,
      },
      ...historyMessages,
      {
        role: 'user',
        content: question,
      },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.6,
        max_tokens: 500,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content?.trim()
      if (content) {
        return { answer: postProcessAssistantAnswer(question, user, content), error: '' }
      }
    } else {
      const errorPayload = await response.json().catch(() => ({}))
      const errorCode = errorPayload?.error?.code || ''
      const errorType = errorPayload?.error?.type || ''

      if (response.status === 429 || errorCode === 'insufficient_quota') {
        return {
          answer: '',
          error: 'OpenAI quota is exceeded. Falling back to Gemini if configured.',
        }
      }

      if (response.status === 401 || errorType === 'invalid_request_error') {
        return {
          answer: '',
          error: 'OpenAI key is invalid or not authorized for this project.',
        }
      }

      if (response.status === 404 || errorCode === 'model_not_found') {
        return {
          answer: '',
          error: `Configured OpenAI model "${process.env.OPENAI_MODEL || 'gpt-4o-mini'}" is not available for your account.`,
        }
      }
    }
  } catch {
    return { answer: '', error: '' }
  }

  return { answer: '', error: '' }
}

async function askGemini(question, user, historyMessages) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { answer: '', error: '' }
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const normalizedHistory = historyMessages.map((entry) => ({
    role: entry.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: entry.content }],
  }))

  const contents = [
    ...normalizedHistory,
    {
      role: 'user',
      parts: [{ text: question }],
    },
  ]

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are BigD AI Assistant. ${answerStyleInstructions()} If question is fitness related, provide actionable safe guidance. If the question is about calories or weight loss, provide a best-effort estimate using the available profile even if some details are missing. Use prior conversation context when relevant.`,
              },
              {
                text: `User profile: ${profileText(user)}`,
              },
            ],
          },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 500,
          },
        }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      const content = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('\n').trim()
      if (content) {
        return { answer: postProcessAssistantAnswer(question, user, content), error: '' }
      }
    } else {
      const errorPayload = await response.json().catch(() => ({}))
      const errorCode = errorPayload?.error?.status || ''

      if (response.status === 429 || errorCode === 'RESOURCE_EXHAUSTED') {
        return {
          answer: '',
          error: 'Gemini quota is exceeded. Please check your Google AI Studio quota/billing.',
        }
      }

      if (response.status === 401 || response.status === 403) {
        return {
          answer: '',
          error: 'Gemini key is invalid or not authorized for this project.',
        }
      }

      if (response.status === 404) {
        return {
          answer: '',
          error: `Configured Gemini model "${model}" is not available for your account.`,
        }
      }
    }
  } catch {
    return { answer: '', error: 'Gemini request failed due to a temporary network/provider issue.' }
  }

  return { answer: '', error: '' }
}

export async function answerQuestion(question, user, history = []) {
  const trimmedQuestion = cleanText(question || '')

  if (!trimmedQuestion) {
    return 'Please type a question and I will answer it.'
  }

  const historyMessages = sanitizeHistory(history)
  const openAIResult = await askOpenAI(trimmedQuestion, user, historyMessages)
  if (openAIResult.answer) {
    return openAIResult.answer
  }

  const geminiResult = await askGemini(trimmedQuestion, user, historyMessages)
  if (geminiResult.answer) {
    return postProcessAssistantAnswer(trimmedQuestion, user, geminiResult.answer)
  }

  try {
    const duckDuckGoAnswer = await getDuckDuckGoAnswer(trimmedQuestion)
    if (duckDuckGoAnswer) {
      return duckDuckGoAnswer
    }
  } catch {
    // Fall through to local answer generation.
  }

  const localAnswer = buildWorkoutAnswer(trimmedQuestion, user)
  if (localAnswer) {
    return localAnswer
  }

  if (openAIResult.error && geminiResult.error) {
    return `${openAIResult.error} ${geminiResult.error}`
  }

  if (geminiResult.error) {
    return geminiResult.error
  }

  if (openAIResult.error) {
    return openAIResult.error
  }

  return 'I could not generate an answer right now. Please try again.'
}