'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Check, CheckCircle, ChevronRight, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Briefing, Signal } from '@/lib/types'

interface BriefingPanelProps {
  briefing?: Briefing
  signal?: Signal
  onSave: () => void
  onDismiss: () => void
  onActed: () => void
  onShare: () => void
  onFeedback: (f: 'useful' | 'not-relevant') => void
  onContextOpen: () => void
  isSaved: boolean
  isActed: boolean
  usefulActive: boolean
  notRelevantActive: boolean
}

const sectionLabel: Record<string, string> = {
  what_changed:     'What Changed',
  why_it_matters:   'Why It Matters',
  what_to_consider: 'What to Consider',
}

export default function BriefingPanel({
  briefing,
  signal,
  onSave,
  onDismiss,
  onActed,
  onShare,
  onFeedback,
  onContextOpen,
  isSaved: isSavedProp,
  isActed: isActedProp,
  usefulActive: usefulProp,
  notRelevantActive: notRelevantProp,
}: BriefingPanelProps) {
  const [isSaved, setIsSaved]           = useState(isSavedProp)
  const [isActed, setIsActed]           = useState(isActedProp)
  const [usefulActive, setUseful]       = useState(usefulProp)
  const [notRelevant, setNotRelevant]   = useState(notRelevantProp)
  const [confirmation, setConfirmation] = useState<'saved' | 'acted' | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsSaved(isSavedProp)
    setIsActed(isActedProp)
    setUseful(usefulProp)
    setNotRelevant(notRelevantProp)
    setConfirmation(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [signal?.id, isSavedProp, isActedProp, usefulProp, notRelevantProp])

  function showConfirmation(type: 'saved' | 'acted') {
    setConfirmation(type)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setConfirmation(null), 2000)
  }

  function handleSave() {
    setIsSaved(true)
    onSave()
    showConfirmation('saved')
  }

  function handleActed() {
    setIsActed(true)
    onActed()
    showConfirmation('acted')
  }

  function handleUseful() {
    setUseful(true)
    setNotRelevant(false)
    onFeedback('useful')
  }

  function handleNotRelevant() {
    setNotRelevant(true)
    setUseful(false)
    onFeedback('not-relevant')
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [signal?.id])

  return (
    <div
      ref={scrollRef}
      style={{
        overflowY: 'auto',
        backgroundColor: 'var(--s1)',
        height: '100%',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={signal?.id ?? 'empty'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
      {(!briefing || !signal) ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            fontSize: 13,
            color: 'var(--tt)',
          }}
        >
          Select a signal to read its briefing
        </div>
      ) : (
      <div style={{ padding: '32px 36px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>

        {/* Opening statement */}
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--tp)',
            letterSpacing: '-0.3px',
            lineHeight: 1.3,
            marginBottom: 28,
            textAlign: 'center',
          }}
        >
          {briefing.openingStatement}
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 24 }} />

        {/* Sections */}
        {briefing.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div
              style={{
                backgroundColor: 'var(--s2)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {/* Label */}
              <div style={{ padding: '12px 16px 10px' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: 'var(--tt)',
                  }}
                >
                  {sectionLabel[section.type]}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

              {/* Body */}
              <div style={{ padding: '12px 16px 14px' }}>
                {section.type === 'what_to_consider' ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(section.prompts ?? [section.text]).map((prompt, j) => (
                      <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--at)', flexShrink: 0, marginTop: 1 }}>→</span>
                        <span style={{ fontSize: 14, color: 'var(--ts)', lineHeight: 1.5 }}>{prompt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 15, color: 'var(--ts)', lineHeight: 1.7, margin: 0 }}>
                    {section.text}
                  </p>
                )}
              </div>
            </div>

            {i < briefing.sections.length - 1 && (
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginTop: 24, marginBottom: 0 }} />
            )}
          </div>
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

        {/* Action bar */}
        <div style={{ padding: '24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ActionBtn
            onClick={handleUseful}
            active={usefulActive}
            activeColor="var(--pos)"
            activeBg="rgba(34,197,94,0.12)"
            icon={<ThumbsUp size={13} />}
            label="Useful"
          />
          <ActionBtn
            onClick={handleNotRelevant}
            active={notRelevant}
            activeColor="var(--crit)"
            activeBg="rgba(232,69,95,0.12)"
            icon={<ThumbsDown size={13} />}
            label="Not relevant"
          />

          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', flexShrink: 0 }} />

          <ActionBtn
            onClick={handleActed}
            active={isActed}
            activeColor="var(--at)"
            activeBg="rgba(92,92,240,0.1)"
            icon={isActed ? <CheckCircle size={13} /> : undefined}
            label={isActed ? 'Acted ✓' : 'Acted'}
          />
          <DismissBtn onClick={onDismiss} />
          <ActionBtn
            onClick={handleSave}
            active={isSaved}
            activeColor="var(--pos)"
            activeBg="var(--adim)"
            icon={isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            label={isSaved ? 'Saved ✓' : 'Save'}
          />
          <ActionBtn
            onClick={onShare}
            active={false}
            activeColor="var(--at)"
            activeBg="transparent"
            icon={<Share2 size={13} />}
            label="Share"
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

        {/* Confirmation text */}
        {confirmation && (
          <p style={{ fontSize: 11, color: 'var(--ts)', margin: '6px 0 0' }}>
            {confirmation === 'saved' ? 'Saved.' : 'Marked.'}
          </p>
        )}

        {/* See context link */}
        <button
          onClick={onContextOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '16px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--at)' }}>See Context</span>
          <ChevronRight size={14} style={{ color: 'var(--at)' }} />
        </button>

      </div>
      </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── Shared sub-components ── */

interface ActionBtnProps {
  onClick: () => void
  active: boolean
  activeColor: string
  activeBg: string
  icon?: React.ReactNode
  label: string
}

function ActionBtn({ onClick, active, activeColor, activeBg, icon, label }: ActionBtnProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 14px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        color: active ? activeColor : hovered ? 'var(--tp)' : 'var(--ts)',
        backgroundColor: active ? activeBg : hovered ? 'var(--s4)' : 'var(--s3)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function DismissBtn({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 14px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        color: hovered ? 'var(--crit)' : 'var(--ts)',
        backgroundColor: hovered ? 'var(--s4)' : 'var(--s3)',
      }}
    >
      Dismiss
    </button>
  )
}
