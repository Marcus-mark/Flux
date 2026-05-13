'use client'

import SignalItem from '@/components/terminal/SignalItem'
import type { Signal } from '@/lib/types'

type Filter = 'all' | 'crit' | 'high'

interface SignalQueueProps {
  signals: Signal[]
  activeSignalId: string | null
  filter: Filter
  onSignalSelect: (id: string) => void
  onFilterChange: (f: Filter) => void
}

const tabs: { key: Filter; label: string }[] = [
  { key: 'all',  label: 'All'    },
  { key: 'crit', label: 'Critial' },
  { key: 'high', label: 'High'   },
]

function applyFilter(signals: Signal[], filter: Filter): Signal[] {
  return signals
    .filter(s => s.state !== 'dismissed')
    .filter(s => {
      if (filter === 'crit') return s.tier === 'CRITICAL'
      if (filter === 'high') return s.tier === 'CRITICAL' || s.tier === 'HIGH'
      return true
    })
    .sort((a, b) => b.score - a.score)
}

export default function SignalQueue({
  signals,
  activeSignalId,
  filter,
  onSignalSelect,
  onFilterChange,
}: SignalQueueProps) {
  const nonDismissed = signals.filter(s => s.state !== 'dismissed')
  const filtered = applyFilter(signals, filter)
  const hiddenCount = nonDismissed.length - filtered.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header + filter — single unified row */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
          height: 44,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: 'var(--tt)',
            flexShrink: 0,
          }}
        >
          Signals
        </span>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          {tabs.map(tab => {
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onFilterChange(tab.key)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: isActive ? '4px 14px' : '4px 10px',
                  color: isActive ? 'var(--tp)' : 'var(--ts)',
                  backgroundColor: isActive ? 'var(--acc)' : 'transparent',
                  border: 'none',
                  borderRadius: 99,
                  cursor: 'pointer',
                  transition: 'color 0.12s ease, background-color 0.12s ease',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--tp)'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ts)'
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--tt)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {nonDismissed.length}
        </span>
      </div>

      {/* Signal list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {nonDismissed.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: 12,
              color: 'var(--tt)',
            }}
          >
            No signals in queue
          </div>
        ) : (
          <>
            {filtered.map(signal => (
              <SignalItem
                key={signal.id}
                signal={signal}
                isActive={signal.id === activeSignalId}
                onClick={() => onSignalSelect(signal.id)}
              />
            ))}
            {hiddenCount > 0 && (
              <div
                style={{
                  padding: '10px 16px',
                  fontSize: 10,
                  color: 'var(--td)',
                }}
              >
                {hiddenCount} signal{hiddenCount !== 1 ? 's' : ''} below filter
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 10,
          fontFamily: 'monospace',
          color: 'var(--tt)',
        }}
      >
        {nonDismissed.length} signal{nonDismissed.length !== 1 ? 's' : ''} · 3 min ago
      </div>

    </div>
  )
}
