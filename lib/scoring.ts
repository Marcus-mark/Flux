import type { Signal, SignalTier, UserContext } from '@/lib/types'

const CREDIBLE_TIER1 = ['openai', 'anthropic', 'github', 'google']
const CREDIBLE_TIER2 = ['techcrunch', 'verge', 'reuters']
const CREDIBLE_TIER3 = ['producthunt', 'hacker news', 'hackernews', 'hn']

function parseAgeHours(timestamp: string): number {
  const h = timestamp.match(/^(\d+)\s*h/)
  if (h) return parseInt(h[1], 10)
  const d = timestamp.match(/^(\d+)\s*d/)
  if (d) return parseInt(d[1], 10) * 24
  const m = timestamp.match(/^(\d+)\s*m/)
  if (m) return parseInt(m[1], 10) / 60
  return 999
}

function scoreDomainMatch(signal: Signal, interests: string[]): { points: number; explanation: string } {
  const tag = signal.tag.toLowerCase()
  for (const interest of interests) {
    const i = interest.toLowerCase()
    if (tag === i) return { points: 30, explanation: `exact match on "${interest}"` }
  }
  for (const interest of interests) {
    const i = interest.toLowerCase()
    const words = i.split(/[\s&,/]+/)
    if (words.some(w => w.length > 2 && tag.includes(w))) {
      return { points: 15, explanation: `partial match — "${signal.tag}" overlaps with "${interest}"` }
    }
    if (tag.split(/[\s&,/]+/).some(w => w.length > 2 && i.includes(w))) {
      return { points: 15, explanation: `partial match — "${signal.tag}" overlaps with "${interest}"` }
    }
  }
  return { points: 0, explanation: 'no match with tracked interests' }
}

function scoreNovelty(timestamp: string): { points: number; explanation: string } {
  const hours = parseAgeHours(timestamp)
  if (hours < 1)  return { points: 20, explanation: 'breaking — under 1 hour old' }
  if (hours <= 3) return { points: 15, explanation: `${timestamp} — within the last 3 hours` }
  if (hours <= 6) return { points: 10, explanation: `${timestamp} — within the last 6 hours` }
  return { points: 5, explanation: `${timestamp} — older than 6 hours` }
}

function scoreSourceCredibility(source: string): { points: number; explanation: string } {
  const s = source.toLowerCase()
  if (CREDIBLE_TIER1.some(k => s.includes(k))) return { points: 20, explanation: `${source} is a primary source` }
  if (CREDIBLE_TIER2.some(k => s.includes(k))) return { points: 15, explanation: `${source} is a credible media outlet` }
  if (CREDIBLE_TIER3.some(k => s.includes(k))) return { points: 12, explanation: `${source} is a community source` }
  return { points: 8, explanation: `${source} — unverified credibility` }
}

function scoreWatchlistMatch(signal: Signal, watchlist: string[]): { points: number; explanation: string } {
  const haystack = `${signal.source} ${signal.headline}`.toLowerCase()
  for (const entry of watchlist) {
    if (haystack.includes(entry.toLowerCase())) {
      return { points: 20, explanation: `"${entry}" matched in ${signal.source.toLowerCase() === entry.toLowerCase() ? 'source' : 'headline'}` }
    }
  }
  return { points: 0, explanation: 'no watchlist entity mentioned' }
}

function scoreTimeSensitivity(signal: Signal): { points: number; explanation: string } {
  const tag = signal.tag
  if (tag === 'API Change' || tag === 'Competitor Move') {
    return { points: 10, explanation: `${tag} signals require immediate awareness` }
  }
  if (tag === 'Product Launch' || tag === 'Model Release') {
    return { points: 7, explanation: `${tag} is time-sensitive but not immediately actionable` }
  }
  return { points: 4, explanation: `${tag} has lower inherent urgency` }
}

function tierFromScore(score: number): SignalTier {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  return 'MEDIUM'
}

export function calculateRelevanceScore(
  signal: Signal,
  userContext: UserContext,
): { score: number; tier: SignalTier; reasoning: string } {
  const domain      = scoreDomainMatch(signal, userContext.interests)
  const novelty     = scoreNovelty(signal.timestamp)
  const source      = scoreSourceCredibility(signal.source)
  const watchlist   = scoreWatchlistMatch(signal, userContext.watchlist)
  const sensitivity = scoreTimeSensitivity(signal)

  const score = Math.min(
    100,
    domain.points + novelty.points + source.points + watchlist.points + sensitivity.points,
  )
  const tier = tierFromScore(score)

  const reasoning =
    `Domain match: ${domain.explanation}. ` +
    `Novelty: ${novelty.explanation}. ` +
    `Source: ${source.explanation}. ` +
    `Watchlist: ${watchlist.explanation}. ` +
    `Time sensitivity: ${sensitivity.explanation}.`

  return { score, tier, reasoning }
}

export function getSortedSignals(signals: Signal[], userContext: UserContext): Signal[] {
  return signals
    .map(signal => {
      const { score, tier } = calculateRelevanceScore(signal, userContext)
      return { ...signal, score, tier }
    })
    .sort((a, b) => b.score - a.score)
}
