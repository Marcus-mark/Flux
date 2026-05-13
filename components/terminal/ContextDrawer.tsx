'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, PanelRight } from 'lucide-react'
import type { Briefing, Signal } from '@/lib/types'

type Tab = 'sources' | 'related' | 'timeline' | 'reasoning'

interface ContextDrawerProps {
  isOpen: boolean
  activeTab: Tab
  briefing: Briefing | undefined
  signal: Signal | undefined
  onClose: () => void
  onTabChange: (tab: string) => void
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'sources',   label: 'Sources'   },
  { key: 'related',   label: 'Related'   },
  { key: 'timeline',  label: 'Timeline'  },
  { key: 'reasoning', label: 'Reasoning' },
]

function Empty({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 12, color: 'var(--tt)', padding: 16 }}>{text}</p>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--s3)',
        borderRadius: 8,
        padding: '14px 16px',
      }}
    >
      {children}
    </div>
  )
}

function parseRelated(str: string): { headline: string; source: string; time: string } {
  const parts = str.split(' · ')
  if (parts.length >= 3) {
    return {
      headline: parts.slice(0, parts.length - 2).join(' · '),
      source:   parts[parts.length - 2],
      time:     parts[parts.length - 1],
    }
  }
  return { headline: str, source: '', time: '' }
}

export default function ContextDrawer({
  isOpen,
  activeTab,
  briefing,
  signal,
  onClose,
  onTabChange,
}: ContextDrawerProps) {
  const [localTab, setLocalTab] = useState<string>(activeTab)

  function handleTabChange(tab: string) {
    setLocalTab(tab)
    onTabChange(tab)
  }

  const reasoningCards = briefing?.reasoningText
    ? briefing.reasoningText.split(/\.\s+/).filter(Boolean).map(s => s.endsWith('.') ? s : s + '.')
    : []

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            position: 'fixed',
            right: 0,
            top: 56,
            height: 'calc(100vh - 56px)',
            width: 320,
            zIndex: 40,
            backgroundColor: 'var(--s2)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 18px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <PanelRight size={16} style={{ color: 'var(--tt)' }} />
            </button>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: 'var(--tt)',
              }}
            >
              Context
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Tab triggers */}
            <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
              {tabs.map(tab => (
                <TabTrigger
                  key={tab.key}
                  value={tab.key}
                  label={tab.label}
                  isActive={localTab === tab.key}
                  onClick={() => handleTabChange(tab.key)}
                />
              ))}
            </div>

            {/* Tab panels */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <motion.div
                key={localTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
              {localTab === 'sources' && (
                !briefing || briefing.sources.length === 0 ? (
                  <Empty text="No sources available" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 18 }}>
                    {briefing.sources.map((src, i) => (
                      <Card key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <span style={{ fontSize: 13, color: 'var(--tp)' }}>{src.name}</span>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--at)',
                              backgroundColor: 'var(--s4)',
                              padding: '8px 12px',
                              borderRadius: 6,
                              textDecoration: 'none',
                              flexShrink: 0,
                            }}
                          >
                            <ExternalLink size={11} />
                            {src.label.replace('→ ', '')}
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              )}

              {localTab === 'related' && (
                !briefing || !briefing.relatedSignals?.length ? (
                  <Empty text="No related signals" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 18 }}>
                    {briefing.relatedSignals.map((s, i) => {
                      const { headline, source, time } = parseRelated(s)
                      return (
                        <Card key={i}>
                          <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5, marginBottom: source ? 10 : 0 }}>
                            {headline}
                          </p>
                          {(source || time) && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                              {source && <span style={{ fontSize: 11, color: 'var(--tt)' }}>{source}</span>}
                              {time   && <span style={{ fontSize: 11, color: 'var(--tt)' }}>{time}</span>}
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )
              )}

              {localTab === 'timeline' && (
                !briefing || !briefing.timeline?.length ? (
                  <Empty text="No timeline events" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 18 }}>
                    {briefing.timeline.map((item, i) => (
                      <Card key={i}>
                        <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5, marginBottom: 10 }}>
                          {item.event}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--tt)' }}>
                            {item.date}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              )}

              {localTab === 'reasoning' && (
                !briefing || !briefing.reasoningText ? (
                  <Empty text="No reasoning available" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 18 }}>
                    {reasoningCards.map((point, i) => (
                      <Card key={i}>
                        <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.7, margin: 0 }}>
                          {point}
                        </p>
                      </Card>
                    ))}
                  </div>
                )
              )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TabTrigger({ label, isActive, onClick }: { value: string; label: string; isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        height: 36,
        padding: '0 14px',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        borderBottom: isActive ? '2px solid var(--acc)' : '2px solid transparent',
        marginBottom: -1,
        color: isActive ? 'var(--at)' : hovered ? 'var(--ts)' : 'var(--tt)',
        transition: 'color 0.12s ease',
        outline: 'none',
      }}
    >
      {label}
    </button>
  )
}
