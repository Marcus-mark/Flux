'use client'

import { AnimatePresence, motion } from 'framer-motion'
import SignalItem from '@/components/terminal/SignalItem'
import type { Signal } from '@/lib/types'

type Filter = 'all' | 'crit' | 'high'

interface SignalQueueProps {
  filteredSignals: Signal[]
  totalNonDismissed: number
  activeSignalId: string | null
  filter: Filter
  onSignalSelect: (id: string) => void
  onFilterChange: (f: Filter) => void
}

const tabs: { key: Filter; label: string }[] = [
  { key: 'all',  label: 'All'     },
  { key: 'crit', label: 'Critial' },
  { key: 'high', label: 'High'    },
]

export default function SignalQueue({
  filteredSignals,
  totalNonDismissed,
  activeSignalId,
  filter,
  onSignalSelect,
  onFilterChange,
}: SignalQueueProps) {
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
            fontSize: 11,
            color: 'var(--tt)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {totalNonDismissed}
        </span>
      </div>

      {/* Signal list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        <AnimatePresence initial={false}>
          {filteredSignals.map(signal => (
            <motion.div
              key={signal.id}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <SignalItem
                signal={signal}
                isActive={signal.id === activeSignalId}
                onClick={() => onSignalSelect(signal.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  )
}
