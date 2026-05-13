'use client'

import { Bookmark, Check, Star } from 'lucide-react'
import TierBadge from '@/components/shared/TierBadge'
import type { Signal } from '@/lib/types'

interface SignalItemProps {
  signal: Signal
  isActive: boolean
  onClick: () => void
}

const tierBorderColor: Record<Signal['tier'], string> = {
  CRITICAL: 'var(--crit)',
  HIGH:     'var(--high)',
  MEDIUM:   'var(--med)',
}

function StateDot({ state, isActive }: { state: Signal['state']; isActive: boolean }) {
  if (state === 'saved') {
    return <Bookmark size={11} style={{ color: 'var(--acc)', flexShrink: 0 }} />
  }
  if (state === 'acted') {
    return <Check size={11} style={{ color: 'var(--pos)', flexShrink: 0 }} />
  }

  const dotStyle: React.CSSProperties = {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.12s ease',
  }

  if (isActive || state === 'active') {
    return <span style={{ ...dotStyle, backgroundColor: 'var(--acc)' }} />
  }
  if (state === 'viewed') {
    return <span style={{ ...dotStyle, backgroundColor: 'var(--td)' }} />
  }
  // unread
  return (
    <span
      style={{
        ...dotStyle,
        backgroundColor: 'transparent',
        border: '1.5px solid var(--tt)',
      }}
    />
  )
}

export default function SignalItem({ signal, isActive, onClick }: SignalItemProps) {
  const { tier, score, headline, source, timestamp, tag, state } = signal
  const isViewed = state === 'viewed'
  const headlineColor = !isActive && isViewed ? 'var(--ts)' : 'var(--tp)'

  return (
    <div
      onClick={onClick}
      className="signal-item"
      style={{
        padding: '12px 12px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isActive ? tierBorderColor[tier] : 'transparent'}`,
        borderBottom: '1px solid var(--border)',
        backgroundColor: isActive ? 'var(--s4)' : 'var(--s2)',
        transition: 'background-color 0.12s ease',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--s3)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = isActive ? 'var(--s4)' : 'var(--s2)'
      }}
    >
      {/* Row 1: badge + state dot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isActive && tier === 'CRITICAL' && (
            <Star size={14} fill="var(--crit)" style={{ color: 'var(--crit)', flexShrink: 0 }} />
          )}
          <TierBadge tier={tier} score={score} />
        </div>
        <StateDot state={state} isActive={isActive} />
      </div>

      {/* Row 2: headline */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: headlineColor,
          lineHeight: 1.4,
          marginBottom: 10,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          transition: 'color 0.12s ease',
        }}
      >
        {headline}
      </p>

      {/* Row 3: source · timestamp + tag pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--tt)' }}>
          {source} · {timestamp}
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'var(--tt)',
            backgroundColor: 'var(--s4)',
            padding: '3px 7px',
            borderRadius: 3,
            flexShrink: 0,
          }}
        >
          {tag}
        </span>
      </div>
    </div>
  )
}
