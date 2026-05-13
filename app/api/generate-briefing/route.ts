import Anthropic from '@anthropic-ai/sdk'
import type { Signal, UserContext } from '@/lib/types'

const client = new Anthropic()

const SYSTEM_PROMPT =
  'You are FLUX, a professional intelligence terminal for AI product monitoring. ' +
  'Generate concise, opinionated briefings for operators making fast decisions. ' +
  'Always take a clear position — never hedge. ' +
  'Respond ONLY with valid JSON. No markdown, no backticks, no preamble. Strict JSON only.'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { signal: Signal; userContext: UserContext }
    const { signal, userContext } = body

    const userMessage =
      `Generate a briefing for this signal:\n` +
      `Headline: ${signal.headline}\n` +
      `Source: ${signal.source}\n` +
      `Tier: ${signal.tier}\n` +
      `Tag: ${signal.tag}\n` +
      `User role: ${userContext.role}\n` +
      `User interests: ${userContext.interests.join(', ')}\n` +
      `User watchlist: ${userContext.watchlist.join(', ')}\n\n` +
      `Return exactly this JSON structure:\n` +
      `{\n` +
      `  "openingStatement": "max 20 words, direct, takes a position",\n` +
      `  "whatChanged": "max 40 words, factual",\n` +
      `  "whyItMatters": "max 80 words, specific to user context, opinionated",\n` +
      `  "whatToConsider": ["max 25 words each, start with a verb, 1-3 items"]\n` +
      `}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const briefing = JSON.parse(raw)

    return Response.json({ ok: true, briefing })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const safe = message.replace(/sk-ant-[^\s"']*/g, '[REDACTED]')
    return Response.json({ ok: false, error: safe }, { status: 500 })
  }
}
