'use client'

import { useState } from 'react'
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
import type { Briefing, Signal } from '@/lib/types'

const initialSignals: Signal[] = [
  {
    id: 'sig-1',
    tier: 'CRITICAL',
    score: 94,
    headline: 'OpenAI removes GPT-4 from API — calls rerouting to GPT-4o',
    source: 'OpenAI',
    timestamp: '1h ago',
    tag: 'API Change',
    state: 'unread',
  },
  {
    id: 'sig-2',
    tier: 'HIGH',
    score: 83,
    headline: 'Mistral launches Le Chat Pro with code interpreter',
    source: 'Mistral',
    timestamp: '2h ago',
    tag: 'Product Launch',
    state: 'unread',
  },
  {
    id: 'sig-3',
    tier: 'HIGH',
    score: 77,
    headline: 'GitHub Copilot adds Claude 3.5 Sonnet in VS Code',
    source: 'GitHub',
    timestamp: '3h ago',
    tag: 'Integration',
    state: 'unread',
  },
  {
    id: 'sig-4',
    tier: 'MEDIUM',
    score: 64,
    headline: 'Perplexity raises $500M at $9B valuation',
    source: 'Perplexity',
    timestamp: '4h ago',
    tag: 'Funding',
    state: 'unread',
  },
  {
    id: 'sig-5',
    tier: 'MEDIUM',
    score: 58,
    headline: 'Replit releases Agent SDK for third-party tools',
    source: 'Replit',
    timestamp: '5h ago',
    tag: 'SDK Release',
    state: 'unread',
  },
]

const briefings: Briefing[] = [
  {
    signalId: 'sig-1',
    openingStatement:
      'OpenAI just removed GPT-4 from the API with no migration window. If your product calls gpt-4, it is already affected.',
    sections: [
      {
        type: 'what_changed',
        text: 'OpenAI deprecated gpt-4 API access across all tiers. Calls now route silently to gpt-4o. No warning was issued. No opt-out exists.',
      },
      {
        type: 'why_it_matters',
        text: 'Silent rerouting means your output behaviour has already changed. GPT-4o is a different model — prompts validated on GPT-4 will drift. Any product built on consistent GPT-4 output is now operating on unvalidated assumptions.',
      },
      {
        type: 'what_to_consider',
        text: '',
        prompts: [
          'Audit codebase for gpt-4 model strings today.',
          'Run regression tests against gpt-4o on your core prompts.',
          'If GPT-4 consistency was in your pitch, update it now.',
        ],
      },
    ],
    reasoningText:
      'Domain match: direct API deprecation. Novelty: forced migration, no window. Time sensitivity: live now.',
    sources: [{ name: 'OpenAI status page', url: '#', label: '→ Read' }],
    relatedSignals: ['Developers report output drift after GPT-4→GPT-4o reroute · HN · 2h ago'],
    timeline: [{ date: 'Mar 2024', event: 'GPT-4 Turbo replaced GPT-4 silently.' }],
  },
]

function getBriefing(id: string): Briefing | undefined {
  return briefings.find(b => b.signalId === id)
}

export default function TerminalPage() {
  const [signals, setSignals] = useState<Signal[]>(initialSignals)
  const [activeSignalId, setActiveSignalId] = useState<string | null>(initialSignals[0].id)
  const [filter, setFilter] = useState<'all' | 'crit' | 'high'>('all')
  const [contextOpen, setContextOpen] = useState(false)
  const [contextTab, setContextTab] = useState<'sources' | 'related' | 'timeline' | 'reasoning'>('sources')

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
    handleContextClose()
  }

  const activeSignal   = signals.find(s => s.id === activeSignalId)
  const activeBriefing = activeSignalId ? getBriefing(activeSignalId) : undefined

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
          <button className="flex items-center gap-1.5 text-[12px]" style={{ color: '#606080' }}>
            <Archive size={13} />
            Archive
          </button>

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

      {/* ── Three columns ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Signals */}
        <aside
          className="flex-shrink-0 overflow-hidden"
          style={{ width: 400, borderRight: '1px solid var(--border)' }}
        >
          <SignalQueue
            signals={signals}
            activeSignalId={activeSignalId}
            filter={filter}
            onSignalSelect={handleSignalSelect}
            onFilterChange={f => setFilter(f)}
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

          {/* BriefingPanel fills remaining height */}
          <div className="flex-1 overflow-hidden">
            <BriefingPanel
              briefing={activeBriefing}
              signal={activeSignal}
              onSave={() => console.log('save', activeSignalId)}
              onDismiss={() => console.log('dismiss', activeSignalId)}
              onActed={() => console.log('acted', activeSignalId)}
              onShare={() => console.log('share', activeSignalId)}
              onFeedback={f => console.log('feedback', activeSignalId, f)}
              onContextOpen={handleContextOpen}
              isSaved={false}
              isActed={false}
              usefulActive={false}
              notRelevantActive={false}
            />
          </div>
        </main>

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
