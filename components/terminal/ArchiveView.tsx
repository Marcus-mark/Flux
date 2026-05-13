'use client'

import { useState } from 'react'
import { ArrowLeft, Bookmark, Check, Circle, X } from 'lucide-react'
import type { Briefing, Signal } from '@/lib/types'

type ArchiveFilter = 'all' | 'saved' | 'acted' | 'week'

interface ArchiveViewProps {
  signals: Signal[]
  briefings?: Briefing[]
  onClose: () => void
}

const filterTabs: { key: ArchiveFilter; label: string }[] = [
  { key: 'all',   label: 'All'       },
  { key: 'saved', label: 'Saved'     },
  { key: 'acted', label: 'Acted'     },
  { key: 'week',  label: 'This week' },
]

const tierColor: Record<Signal['tier'], string> = {
  CRITICAL: 'var(--crit)',
  HIGH:     'var(--high)',
  MEDIUM:   'var(--med)',
}

function parseHours(ts: string): number {
  const h = ts.match(/^(\d+)h/)
  if (h) return parseInt(h[1], 10)
  const d = ts.match(/^(\d+)d/)
  if (d) return parseInt(d[1], 10) * 24
  return 0
}

function groupLabel(ts: string): string {
  const hours = parseHours(ts)
  if (hours < 24) return 'Today'
  if (hours < 48) return 'Yesterday'
  const days = Math.floor(hours / 24)
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function buildGroups(signals: Signal[]): Array<{ label: string; items: Signal[] }> {
  const map = new Map<string, Signal[]>()
  const order: string[] = []
  for (const s of signals) {
    const lbl = groupLabel(s.timestamp)
    if (!map.has(lbl)) { map.set(lbl, []); order.push(lbl) }
    map.get(lbl)!.push(s)
  }
  return order.map(lbl => ({ label: lbl, items: map.get(lbl)! }))
}

/* ── Sub-components ── */

function BackBtn({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 30,
        padding: '0 16px',
        fontSize: 13,
        fontWeight: 500,
        color: hovered ? 'var(--tp)' : 'var(--ts)',
        backgroundColor: hovered ? 'var(--s3)' : 'var(--s2)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.12s ease',
        outline: 'none',
      }}
    >
      <ArrowLeft size={13} />
      Back to Terminal
    </button>
  )
}

function FilterPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: isActive ? '4px 16px' : '4px 8px',
        color: isActive ? 'var(--tp)' : hovered ? 'var(--tp)' : 'var(--ts)',
        backgroundColor: isActive ? 'var(--acc)' : 'transparent',
        border: 'none',
        borderRadius: 99,
        cursor: 'pointer',
        outline: 'none',
        transition: 'color 0.12s ease, background-color 0.12s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function StateIcon({ signal }: { signal: Signal }) {
  const color = tierColor[signal.tier]
  if (signal.state === 'acted') {
    return <Check size={12} style={{ color, flexShrink: 0 }} />
  }
  if (signal.state === 'saved') {
    return <Bookmark size={12} style={{ color, flexShrink: 0 }} />
  }
  return <Circle size={9} style={{ color: 'var(--tt)', flexShrink: 0 }} />
}

function ArchiveRow({ signal, onClick }: { signal: Signal; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const color = tierColor[signal.tier]
  const displayTs = signal.timestamp.replace(/(\d+)([hd])/, '$1 $2')

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 44,
        cursor: 'pointer',
        backgroundColor: hovered ? 'var(--s3)' : 'var(--s2)',
        borderRadius: 6,
        marginBottom: 4,
        padding: '0 16px',
        gap: 16,
        transition: 'background-color 0.12s ease',
      }}
    >
      {/* State icon */}
      <StateIcon signal={signal} />

      {/* Tier · Score — fixed min-width so headlines align */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 110 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color,
          }}
        >
          {signal.tier}
        </span>
        <span style={{ fontSize: 10, color, opacity: 0.7 }}>·</span>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color }}>
          {signal.score}
        </span>
      </div>

      {/* Headline */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: 'var(--ts)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {signal.headline}
      </span>

      {/* Timestamp */}
      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--tt)', flexShrink: 0 }}>
        {displayTs}
      </span>
    </div>
  )
}

function BriefingModal({ signal, briefing, onClose }: { signal: Signal; briefing?: Briefing; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7,7,15,0.85)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--s2)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '32px 36px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--tp)', lineHeight: 1.3, margin: 0 }}>
            {signal.headline}
          </p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, color: 'var(--tt)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: tierColor[signal.tier] }}>
            {signal.tier}
          </span>
          <span style={{ fontSize: 11, color: 'var(--tt)' }}>{signal.source} · {signal.timestamp}</span>
        </div>

        {briefing ? (
          <>
            {briefing.openingStatement && (
              <p style={{ fontSize: 15, color: 'var(--ts)', lineHeight: 1.7, marginBottom: 20 }}>
                {briefing.openingStatement}
              </p>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 20 }} />
            {briefing.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--tt)', marginBottom: 8, marginTop: 0 }}>
                  {section.type.replace(/_/g, ' ')}
                </p>
                {section.type === 'what_to_consider' ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(section.prompts ?? [section.text]).map((p, j) => (
                      <li key={j} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ color: 'var(--at)', flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 15, color: 'var(--ts)', lineHeight: 1.7 }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 15, color: 'var(--ts)', lineHeight: 1.7, margin: 0 }}>{section.text}</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--tt)' }}>No briefing available for this signal.</p>
        )}
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function ArchiveView({ signals, briefings, onClose }: ArchiveViewProps) {
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>('all')
  const [modalSignal, setModalSignal]   = useState<Signal | null>(null)

  const filtered = signals
    .filter(s => s.state !== 'dismissed')
    .filter(s => {
      if (activeFilter === 'saved') return s.state === 'saved'
      if (activeFilter === 'acted') return s.state === 'acted'
      if (activeFilter === 'week')  return parseHours(s.timestamp) <= 168
      return true
    })

  const groups = buildGroups(filtered)
  const modalBriefing = modalSignal ? briefings?.find(b => b.signalId === modalSignal.id) : undefined

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--void)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
        }}
      >
        {/* ── Archive nav bar ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            height: 44,
            padding: '0 48px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--s1)',
          }}
        >
          <BackBtn onClick={onClose} />

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {filterTabs.map(tab => (
              <FilterPill
                key={tab.key}
                label={tab.label}
                isActive={activeFilter === tab.key}
                onClick={() => setActiveFilter(tab.key)}
              />
            ))}
          </div>

          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--tt)' }}>
            ARCHIVE
          </span>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 920, margin: '0 auto', paddingTop: 32, paddingBottom: 48 }}>

            {filtered.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--tt)', marginTop: 60 }}>
                No signals in archive.
              </p>
            ) : (
              groups.map((group, i) => (
                <div key={group.label}>
                  {i > 0 && (
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '28px 0 20px' }} />
                  )}
                  <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--tt)', margin: '0 0 8px' }}>
                    {group.label}
                  </p>
                  {group.items.map(signal => (
                    <ArchiveRow
                      key={signal.id}
                      signal={signal}
                      onClick={() => setModalSignal(signal)}
                    />
                  ))}
                </div>
              ))
            )}

          </div>
        </div>
      </div>

      {modalSignal && (
        <BriefingModal
          signal={modalSignal}
          briefing={modalBriefing}
          onClose={() => setModalSignal(null)}
        />
      )}
    </>
  )
}
