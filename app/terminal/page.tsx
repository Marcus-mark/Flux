'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PanelRight } from 'lucide-react'
import SignalQueue from '@/components/terminal/SignalQueue'
import BriefingPanel from '@/components/terminal/BriefingPanel'
import ContextDrawer from '@/components/terminal/ContextDrawer'
import CommandBar from '@/components/terminal/CommandBar'
import EmptyState from '@/components/shared/EmptyState'
import ArchiveView from '@/components/terminal/ArchiveView'
import { mockBriefings, mockSignals } from '@/lib/mock-data'
import { calculateRelevanceScore, getSortedSignals } from '@/lib/scoring'
import type { Briefing, Signal, UserContext } from '@/lib/types'

const userContext: UserContext = {
  role: 'Founder / Builder',
  interests: ['APIs & dev tools', 'Competitor moves'],
  watchlist: ['OpenAI', 'Anthropic', 'Cursor'],
  threshold: 60,
}

const scoredSignals = getSortedSignals(mockSignals, userContext)

const initialBriefings: Record<string, Briefing> = { ...mockBriefings }
for (const signal of scoredSignals) {
  const { reasoning } = calculateRelevanceScore(signal, userContext)
  if (initialBriefings[signal.id]) {
    initialBriefings[signal.id] = { ...initialBriefings[signal.id], reasoningText: reasoning }
  }
}

export default function TerminalPage() {
  const [signals, setSignals]           = useState<Signal[]>(scoredSignals)
  const [briefings, setBriefings]       = useState<Record<string, Briefing>>(initialBriefings)
  const [activeSignalId, setActiveSignalId] = useState<string | null>(scoredSignals[0].id)
  const [generatingFor, setGeneratingFor]   = useState<string | null>(null)
  const [filter, setFilter]             = useState<'all' | 'crit' | 'high'>('all')
  const [contextOpen, setContextOpen]   = useState(false)
  const [contextTab, setContextTab]     = useState<'sources' | 'related' | 'timeline' | 'reasoning'>('sources')
  const [showArchive, setShowArchive]   = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const nonDismissed = useMemo(
    () => signals.filter(s => s.state !== 'dismissed'),
    [signals]
  )

  const filteredSignals = useMemo(() => {
    return nonDismissed
      .filter(s => {
        if (filter === 'crit') return s.tier === 'CRITICAL'
        if (filter === 'high') return s.tier === 'CRITICAL' || s.tier === 'HIGH'
        return true
      })
      .sort((a, b) => b.score - a.score)
  }, [nonDismissed, filter])

  function applyFilter(sigs: Signal[], f: 'all' | 'crit' | 'high') {
    return sigs
      .filter(s => {
        if (f === 'crit') return s.tier === 'CRITICAL'
        if (f === 'high') return s.tier === 'CRITICAL' || s.tier === 'HIGH'
        return true
      })
      .sort((a, b) => b.score - a.score)
  }

  function handleArchiveOpen()  { setShowArchive(true)  }
  function handleArchiveClose() { setShowArchive(false) }

  function handleContextOpen() {
    setContextOpen(true)
    setContextTab('sources')
  }

  function handleContextClose() {
    setContextOpen(false)
  }

  function handleContextTabChange(tab: string) {
    setContextTab(tab as typeof contextTab)
  }

  async function generateAIBriefing(signal: Signal) {
    if (briefings[signal.id]?.isAIGenerated) return
    setGeneratingFor(signal.id)
    try {
      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal, userContext }),
      })
      const data = await res.json()
      if (data.ok) {
        const ai = data.briefing
        setBriefings(prev => ({
          ...prev,
          [signal.id]: {
            ...prev[signal.id],
            openingStatement: ai.openingStatement,
            sections: [
              { type: 'what_changed',     text: ai.whatChanged },
              { type: 'why_it_matters',   text: ai.whyItMatters },
              { type: 'what_to_consider', text: '', prompts: ai.whatToConsider },
            ],
            isAIGenerated: true,
          },
        }))
      }
    } catch {
      // keep mock briefing silently
    } finally {
      setGeneratingFor(prev => prev === signal.id ? null : prev)
    }
  }

  function handleSignalSelect(id: string) {
    setShowArchive(false)
    setActiveSignalId(id)
    setSignals(prev =>
      prev.map(s => s.id === id && s.state === 'unread' ? { ...s, state: 'viewed' } : s)
    )
    setContextOpen(false)
    const signal = signals.find(s => s.id === id)
    if (signal) generateAIBriefing(signal)
  }

  function handleFilterChange(newFilter: 'all' | 'crit' | 'high') {
    setFilter(newFilter)
    const newFiltered = applyFilter(nonDismissed, newFilter)
    if (!newFiltered.find(s => s.id === activeSignalId)) {
      const next = newFiltered[0] ?? null
      setActiveSignalId(next?.id ?? null)
      if (next && next.state === 'unread') {
        setSignals(prev => prev.map(s => s.id === next.id ? { ...s, state: 'viewed' } : s))
      }
    }
  }

  function handleSave() {
    if (!activeSignalId) return
    setSignals(prev => prev.map(s => s.id === activeSignalId ? { ...s, state: 'saved' } : s))
  }

  function handleActed() {
    if (!activeSignalId) return
    setSignals(prev => prev.map(s => s.id === activeSignalId ? { ...s, state: 'acted' } : s))
  }

  function handleDismiss() {
    if (!activeSignalId) return
    const currentIndex = filteredSignals.findIndex(s => s.id === activeSignalId)
    const remaining = filteredSignals.filter(s => s.id !== activeSignalId)
    const next = remaining[Math.min(currentIndex, remaining.length - 1)] ?? null
    setSignals(prev => prev.map(s => {
      if (s.id === activeSignalId) return { ...s, state: 'dismissed' as const }
      if (next && s.id === next.id && s.state === 'unread') return { ...s, state: 'viewed' as const }
      return s
    }))
    setActiveSignalId(next?.id ?? null)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') (e.target as HTMLElement).blur()
        return
      }
      const currentIndex = filteredSignals.findIndex(s => s.id === activeSignalId)
      switch (e.key.toLowerCase()) {
        case 'j': {
          const next = filteredSignals[currentIndex + 1]
          if (next) {
            setActiveSignalId(next.id)
            setSignals(prev => prev.map(s => s.id === next.id && s.state === 'unread' ? { ...s, state: 'viewed' } : s))
            setContextOpen(false)
          }
          break
        }
        case 'k': {
          const prev = filteredSignals[currentIndex - 1]
          if (prev) {
            setActiveSignalId(prev.id)
            setSignals(p => p.map(s => s.id === prev.id && s.state === 'unread' ? { ...s, state: 'viewed' } : s))
            setContextOpen(false)
          }
          break
        }
        case 's':
          if (activeSignalId) setSignals(prev => prev.map(s => s.id === activeSignalId ? { ...s, state: 'saved' } : s))
          break
        case 'a':
          if (activeSignalId) setSignals(prev => prev.map(s => s.id === activeSignalId ? { ...s, state: 'acted' } : s))
          break
        case 'd': {
          if (!activeSignalId) break
          const remaining = filteredSignals.filter(s => s.id !== activeSignalId)
          const next = remaining[Math.min(currentIndex, remaining.length - 1)] ?? null
          setSignals(prev => prev.map(s => {
            if (s.id === activeSignalId) return { ...s, state: 'dismissed' as const }
            if (next && s.id === next.id && s.state === 'unread') return { ...s, state: 'viewed' as const }
            return s
          }))
          setActiveSignalId(next?.id ?? null)
          break
        }
        case 'c':
          setContextOpen(o => !o)
          break
        case '/':
          e.preventDefault()
          searchRef.current?.focus()
          break
        case 'escape':
          setContextOpen(false)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [signals, filteredSignals, activeSignalId])

  const activeSignal   = signals.find(s => s.id === activeSignalId)
  const activeBriefing = activeSignalId ? briefings[activeSignalId] : undefined
  const isSaved = activeSignal?.state === 'saved'
  const isActed = activeSignal?.state === 'acted'

  return (
    <div
      className="flex flex-col overflow-hidden bg-void"
      style={{ height: '100vh' }}
    >

      <CommandBar
        signals={signals}
        briefings={briefings}
        showArchive={showArchive}
        searchRef={searchRef}
        onSignalSelect={handleSignalSelect}
        onArchiveOpen={handleArchiveOpen}
      />

      {showArchive && (
        <ArchiveView
          signals={signals}
          briefings={Object.values(briefings)}
          onClose={handleArchiveClose}
        />
      )}

      {/* ── Three columns ── */}
      <div className="flex flex-1 overflow-hidden" style={{ display: showArchive ? 'none' : undefined }}>

        {/* LEFT — Signals */}
        <aside
          className="flex-shrink-0 overflow-hidden"
          style={{ width: 400, borderRight: '1px solid var(--border)' }}
        >
          <SignalQueue
            filteredSignals={filteredSignals}
            totalNonDismissed={nonDismissed.length}
            activeSignalId={activeSignalId}
            filter={filter}
            onSignalSelect={handleSignalSelect}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* CENTER — Briefing */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Briefing header bar */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-6"
            style={{ height: 40, borderBottom: '1px solid var(--border)', backgroundColor: 'var(--s1)' }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-ts">
              Briefing
            </span>
            <PanelRight size={16} className="text-tt" />
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-hidden">
            {nonDismissed.length === 0 ? (
              <EmptyState variant="queue" />
            ) : filteredSignals.length === 0 ? (
              <EmptyState variant="filter" onClearFilter={() => handleFilterChange('all')} />
            ) : (
              <BriefingPanel
                briefing={activeBriefing}
                signal={activeSignal}
                onSave={handleSave}
                onDismiss={handleDismiss}
                onActed={handleActed}
                onShare={() => console.log('share', activeSignalId)}
                onFeedback={f => console.log('feedback', activeSignalId, f)}
                onContextOpen={handleContextOpen}
                isSaved={isSaved}
                isActed={isActed}
                usefulActive={false}
                notRelevantActive={false}
                isGenerating={generatingFor === activeSignalId}
              />
            )}
          </div>
        </main>

      </div>

      {/* ── Status bar ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center gap-2"
        style={{ height: 36, borderTop: '1px solid var(--border)', backgroundColor: 'var(--s1)', display: showArchive ? 'none' : undefined }}
      >
        <span style={{ fontSize: 11, color: 'var(--tt)', fontFamily: 'monospace' }}>
          {filter === 'all'
            ? `${nonDismissed.length} signal${nonDismissed.length !== 1 ? 's' : ''} · 3 min ago`
            : `${filteredSignals.length} of ${nonDismissed.length} · ${filter === 'crit' ? 'Critical' : 'High'} filter active`
          }
        </span>
        {filter !== 'all' && (
          <button
            onClick={() => handleFilterChange('all')}
            style={{ fontSize: 11, color: 'var(--at)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            × Clear
          </button>
        )}
      </div>

      <ContextDrawer
        isOpen={contextOpen}
        activeTab={contextTab}
        briefing={activeBriefing}
        signal={activeSignal}
        onClose={handleContextClose}
        onTabChange={handleContextTabChange}
      />

    </div>
  )
}
