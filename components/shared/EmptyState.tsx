'use client'

import { Inbox } from 'lucide-react'
import { useState } from 'react'

interface EmptyStateProps {
  variant: 'queue' | 'filter'
  onClearFilter?: () => void
}

function GhostBtn({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        cursor: 'pointer',
        background: hovered ? 'var(--s4)' : 'var(--s3)',
        color: hovered ? 'var(--tp)' : 'var(--ts)',
        transition: 'all 0.12s ease',
      }}
    >
      {label}
    </button>
  )
}

function AccentBtn({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 16px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: hovered ? '#4a4adc' : 'var(--acc)',
        color: '#fff',
        transition: 'background 0.12s ease',
      }}
    >
      {label}
    </button>
  )
}

export default function EmptyState({ variant, onClearFilter }: EmptyStateProps) {
  const wrapStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 14,
    textAlign: 'center',
    padding: '0 32px',
  }

  if (variant === 'filter') {
    return (
      <div style={wrapStyle}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tp)', margin: 0 }}>
          No signals match this filter.
        </p>
        <p style={{ fontSize: 13, color: 'var(--tt)', lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
          Try High + or clear the filter.
        </p>
        <button
          onClick={onClearFilter}
          style={{ fontSize: 13, color: 'var(--at)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          × Clear filter
        </button>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <Inbox size={22} style={{ color: 'var(--td)' }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tp)', margin: 0 }}>
        No new signals meet your relevance threshold.
      </p>
      <p style={{ fontSize: 13, color: 'var(--tt)', lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
        FLUX is monitoring your sources. You will be alerted if a Critical signal arrives.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <GhostBtn label="Adjust sources" />
        <GhostBtn label="Lower threshold" />
        <AccentBtn label="View Archive" />
      </div>
    </div>
  )
}
