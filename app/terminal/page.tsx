'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  Bell,
  ChevronDown,
  CircleUser,
  Keyboard,
  PanelRight,
  Radio,
  Search,
} from 'lucide-react'
import SignalQueue from '@/components/terminal/SignalQueue'
import BriefingPanel from '@/components/terminal/BriefingPanel'
import ContextDrawer from '@/components/terminal/ContextDrawer'
import EmptyState from '@/components/shared/EmptyState'
import ArchiveView from '@/components/terminal/ArchiveView'
import { mockBriefings, mockSignals } from '@/lib/mock-data'
import type { Signal } from '@/lib/types'

function getBriefing(id: string) {
  return mockBriefings[id]
}

function ArchiveBtn({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      className="flex items-center gap-1.5 text-[12px]"
      style={{ color: isActive ? 'var(--at)' : hovered ? 'var(--ts)' : '#606080', transition: 'color 0.12s ease' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Archive size={13} />
      Archive
    </button>
  )
}

export default function TerminalPage() {
  const [signals, setSignals] = useState<Signal[]>(mockSignals)
  const [activeSignalId, setActiveSignalId] = useState<string | null>(mockSignals[0].id)
  const [filter, setFilter] = useState<'all' | 'crit' | 'high'>('all')
  const [contextOpen, setContextOpen] = useState(false)
  const [contextTab, setContextTab] = useState<'sources' | 'related' | 'timeline' | 'reasoning'>('sources')
  const [showArchive, setShowArchive] = useState(false)
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

  function handleSignalSelect(id: string) {
    setActiveSignalId(id)
    setSignals(prev =>
      prev.map(s => s.id === id && s.state === 'unread' ? { ...s, state: 'viewed' } : s)
    )
    setContextOpen(false)
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
  const activeBriefing = activeSignalId ? getBriefing(activeSignalId) : undefined
  const isSaved = activeSignal?.state === 'saved'
  const isActed = activeSignal?.state === 'acted'

  return (
    <div
      className="flex flex-col overflow-hidden bg-void"
      style={{ height: '100vh' }}
    >

      {/* ── Command Bar ── */}
      <header
        className="flex-shrink-0 flex items-center gap-4 px-4"
        style={{ height: 56, backgroundColor: '#0F0F1A', borderBottom: '1px solid var(--border)' }}
      >
        {/* FLUX logo */}
        <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <path fillRule="evenodd" clipRule="evenodd" d="M35.8926 16.2699C37.0348 15.8513 38.2814 15.8974 39.4306 16.5609C40.4259 17.1356 40.9236 18.0751 41.1719 18.8724C41.4214 19.674 41.4884 20.5411 41.4795 21.3246C41.4615 22.8982 41.1285 24.5715 40.7969 25.7308C40.4928 26.7924 39.386 27.4066 38.3242 27.1029C37.2625 26.7989 36.6475 25.692 36.9511 24.6302C37.2171 23.7003 37.4677 22.394 37.4804 21.2787C37.4868 20.7179 37.4304 20.3122 37.3525 20.0619C37.3459 20.0406 37.3369 20.0226 37.331 20.0062C37.315 20.0104 37.2942 20.0163 37.2685 20.0257C37.0693 20.0989 36.697 20.3288 36.1933 20.8959C35.3646 21.829 34.4852 23.3285 33.6797 25.2367C34.9962 26.4854 35.9834 27.8115 36.5742 29.2377C37.3406 31.0883 37.3862 32.9765 36.8095 34.8226C36.0224 37.3419 34.3929 38.896 32.374 39.1556C30.5934 39.3845 28.6555 38.4845 27.9726 36.7367C27.1484 34.6264 27.1133 32.0011 28.9531 26.475C27.9751 25.6945 26.9473 24.9817 25.125 24.2386C21.5532 22.7822 20.0267 23.6586 19.5166 24.2582C18.896 24.9878 18.7333 26.4161 19.6025 27.7562C20.2553 28.7621 21.3547 29.0786 22.4375 29.4662C23.4771 29.8386 24.0177 30.984 23.6455 32.0238C23.2731 33.0634 22.1286 33.6039 21.0888 33.2318C20.4192 32.9922 17.7829 32.3037 16.2451 29.933C14.6232 27.4323 14.4719 24.0141 16.4687 21.6664C18.5764 19.1885 22.274 18.7559 26.6357 20.5345C28.3199 21.2213 29.5117 21.9287 30.4707 22.6087C31.2745 20.8927 32.1949 19.3737 33.2021 18.2396C33.938 17.4111 34.8347 16.6578 35.8926 16.2699ZM32.1845 29.5521C31.1596 33.1409 31.3958 34.4454 31.6533 35.1625C31.7041 35.1841 31.7788 35.1997 31.8642 35.1888C31.9445 35.1784 32.0903 35.1385 32.2773 34.9584C32.4741 34.7686 32.7579 34.3799 32.9922 33.6302C33.3014 32.6401 33.2717 31.7177 32.8789 30.7689C32.7199 30.385 32.4921 29.9789 32.1845 29.5521Z" fill="#5B5BF0"/>
        </svg>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 flex-shrink-0"
          style={{ width: 384, height: 32, backgroundColor: '#1C1C35', borderRadius: 8 }}
        >
          <Search size={12} style={{ color: '#A0A0C0', flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search briefings and signals..."
            className="flex-1 min-w-0 bg-transparent text-[12px] text-ts placeholder:text-tt outline-none"
          />
        </div>

        {/* AI Product Launches pill */}
        <button
          className="flex-shrink-0 flex items-center gap-1.5 px-3 text-[12px] font-medium text-ts"
          style={{ height: 32, backgroundColor: '#141428', borderRadius: 8 }}
        >
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--acc)', flexShrink: 0 }} />
          AI Product Launches
          <ChevronDown size={12} style={{ color: '#606080' }} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <ArchiveBtn isActive={showArchive} onClick={handleArchiveOpen} />

          <button className="flex items-center gap-1.5 text-[12px]" style={{ color: '#606080' }}>
            <Radio size={13} />
            Sources
          </button>

          <div className="flex-shrink-0" style={{ width: 1, height: 16, backgroundColor: 'var(--border)' }} />

          <Keyboard size={16} style={{ color: '#606080' }} />

          <div className="relative flex-shrink-0">
            <Bell size={16} style={{ color: '#A0A0C0' }} />
            <span
              className="absolute"
              style={{ width: 5, height: 5, backgroundColor: '#EAB308', borderRadius: '50%', top: 0, right: 0 }}
            />
          </div>

          <div className="flex-shrink-0" style={{ width: 1, height: 16, backgroundColor: 'var(--border)' }} />

          <button className="flex items-center gap-1" style={{ color: '#606080' }}>
            <CircleUser size={16} />
            <ChevronDown size={12} />
          </button>
        </div>
      </header>

      {showArchive && (
        <ArchiveView
          signals={signals}
          briefings={Object.values(mockBriefings)}
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
