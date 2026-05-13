'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleDot } from 'lucide-react'
import { mockSignals } from '@/lib/mock-data'

// ── Types ──────────────────────────────────────────────────────────

type Role = 'Founder / Builder' | 'Analyst / Investor' | 'Strategist'
type Interest = 'APIs and dev tools' | 'Competitor moves' | 'Model capabilities' | 'Pricing shifts' | 'Infrastructure' | 'Research'
type CalRating = 'relevant' | 'not-relevant'

interface OnboardingData {
  role: Role | ''
  interests: Interest[]
  trackingText: string
  companiesText: string
  calibrationRatings: Record<string, CalRating>
}

// ── Constants ──────────────────────────────────────────────────────

const ROLES: Role[] = ['Founder / Builder', 'Analyst / Investor', 'Strategist']

const INTERESTS: Interest[] = [
  'APIs and dev tools',
  'Competitor moves',
  'Model capabilities',
  'Pricing shifts',
  'Infrastructure',
  'Research',
]

const SOURCES = [
  'OpenAI Blog',
  'Anthropic Updates',
  'X — AI builders',
  'Product Hunt — AI',
  'GitHub Releases',
  'Hacker News',
]

const STATUS_LINES = [
  'Scanning sources...',
  'Scoring relevance...',
  'Ranking signals...',
  'Preparing your first briefing...',
  'Ready.',
]

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  'sig-1': 'A breaking infrastructure change in a tool you depend on.',
  'sig-2': 'A new AI product entering your competitive landscape.',
  'sig-3': 'A platform integration that changes the developer landscape.',
  'sig-4': 'A funding round that shifts competitive dynamics.',
  'sig-5': 'A new SDK that opens up platform integration possibilities.',
}

const STEP_MS = 1200

// ── Shared sub-components ──────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
      <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--tt)' }}>
        Step {step} of 4
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: i === step ? 'var(--tp)' : 'var(--s4)',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--tp)', margin: '0 0 24px', textAlign: 'center' }}>
      {children}
    </p>
  )
}

function PrimaryBtn({
  onClick,
  disabled,
  label = 'Continue',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: '12px 0',
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 7,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: disabled ? 'var(--s4)' : hov ? 'rgba(92,92,240,0.88)' : 'var(--acc)',
        color: disabled ? 'var(--tt)' : '#fff',
        transition: 'background-color 0.12s ease, color 0.12s ease',
      }}
    >
      {label}
    </button>
  )
}

// ── Step 1 — Domain ────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <StepTitle>Your domain is set.</StepTitle>

      <div
        style={{
          backgroundColor: 'var(--s2)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--acc)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <CircleDot size={14} style={{ color: 'var(--acc)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--tp)' }}>AI Product Launches</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase' as const,
              color: 'var(--pos)',
              backgroundColor: 'rgba(34,197,94,0.12)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            ACTIVE
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--tt)', margin: 0, lineHeight: 1.5 }}>
          Tools, APIs, model releases, and competitor moves in the AI ecosystem.
        </p>
      </div>

      <p style={{ fontSize: 11, color: 'var(--td)', margin: '0 0 32px', textAlign: 'center' }}>
        More domains available in a future version.
      </p>

      <PrimaryBtn onClick={onNext} />
    </div>
  )
}

// ── Step 2 — Context ───────────────────────────────────────────────

function Step2({
  data,
  setData,
  onNext,
}: {
  data: OnboardingData
  setData: (d: OnboardingData) => void
  onNext: () => void
}) {
  const canContinue = data.role !== '' && data.interests.length > 0 && data.trackingText.trim().length > 0

  function toggleInterest(i: Interest) {
    const next = data.interests.includes(i)
      ? data.interests.filter(x => x !== i)
      : [...data.interests, i]
    setData({ ...data, interests: next })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--s2)',
    border: '1px solid var(--border)',
    borderRadius: 7,
    fontSize: 13,
    color: 'var(--tp)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div>
      <StepTitle>Define your focus.</StepTitle>

      {/* Role */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--tt)', margin: '0 0 8px' }}>
          Your role
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ROLES.map(role => {
            const sel = data.role === role
            return (
              <button
                key={role}
                onClick={() => setData({ ...data, role })}
                style={{
                  padding: '10px 14px',
                  backgroundColor: sel ? 'var(--adim)' : 'var(--s2)',
                  border: `1px solid ${sel ? 'var(--acc)' : 'var(--border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: sel ? 600 : 400,
                  color: sel ? 'var(--tp)' : 'var(--ts)',
                  transition: 'all 0.12s ease',
                }}
              >
                {role}
              </button>
            )
          })}
        </div>
      </div>

      {/* Interests */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--tt)', margin: '0 0 8px' }}>
          Focus areas
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INTERESTS.map(interest => {
            const sel = data.interests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: sel ? 'var(--acc)' : 'var(--ts)',
                  backgroundColor: sel ? 'var(--adim)' : 'var(--s2)',
                  border: `1px solid ${sel ? 'var(--acc)' : 'var(--border)'}`,
                  borderRadius: 99,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {interest}
              </button>
            )
          })}
        </div>
      </div>

      {/* Inputs */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="What are you building or tracking?"
          value={data.trackingText}
          onChange={e => setData({ ...data, trackingText: e.target.value })}
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: 28 }}>
        <input
          type="text"
          placeholder="Specific companies or tools (optional)"
          value={data.companiesText}
          onChange={e => setData({ ...data, companiesText: e.target.value })}
          style={inputStyle}
        />
      </div>

      <PrimaryBtn onClick={onNext} disabled={!canContinue} />
    </div>
  )
}

// ── Step 3 — Sources ───────────────────────────────────────────────

function Step3({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <StepTitle>These are your default sources.</StepTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {SOURCES.map(src => (
          <div
            key={src}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              backgroundColor: 'var(--s2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
          >
            <Check size={13} style={{ color: 'var(--pos)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--ts)' }}>{src}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--td)', margin: '0 0 24px', textAlign: 'center' }}>
        Adjust source weights later in Sources.
      </p>

      <PrimaryBtn onClick={onNext} label="Confirm sources" />
    </div>
  )
}

// ── Step 4 — Calibration ───────────────────────────────────────────

function Step4({
  data,
  setData,
  onNext,
}: {
  data: OnboardingData
  setData: (d: OnboardingData) => void
  onNext: () => void
}) {
  const canContinue = Object.keys(data.calibrationRatings).length > 0

  function rate(id: string, rating: CalRating) {
    const cur = data.calibrationRatings[id]
    const next = { ...data.calibrationRatings }
    if (cur === rating) {
      delete next[id]
    } else {
      next[id] = rating
    }
    setData({ ...data, calibrationRatings: next })
  }

  return (
    <div>
      <StepTitle>Calibrate your relevance.</StepTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {mockSignals.map(signal => {
          const rating = data.calibrationRatings[signal.id]
          return (
            <div
              key={signal.id}
              style={{
                backgroundColor: 'var(--s2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--tt)' }}>
                  {signal.source}
                </span>
                <span style={{ fontSize: 9, color: 'var(--s4)' }}>·</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--tt)' }}>
                  {signal.tag}
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tp)', margin: '0 0 4px', lineHeight: 1.3 }}>
                {signal.headline}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ts)', margin: '0 0 10px', lineHeight: 1.4 }}>
                {SIGNAL_DESCRIPTIONS[signal.id]}
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => rate(signal.id, 'relevant')}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: rating === 'relevant' ? 'var(--pos)' : 'var(--ts)',
                    backgroundColor: rating === 'relevant' ? 'rgba(34,197,94,0.1)' : 'var(--s3)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  Relevant
                </button>
                <button
                  onClick={() => rate(signal.id, 'not-relevant')}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: rating === 'not-relevant' ? 'var(--crit)' : 'var(--ts)',
                    backgroundColor: rating === 'not-relevant' ? 'rgba(232,69,95,0.1)' : 'var(--s3)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  Not relevant
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <PrimaryBtn onClick={onNext} disabled={!canContinue} />
      <button
        onClick={onNext}
        style={{
          display: 'block',
          margin: '12px auto 0',
          fontSize: 10,
          color: 'var(--tt)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        Skip calibration
      </button>
    </div>
  )
}

// ── Step 5 — Processing ────────────────────────────────────────────

function Step5() {
  const router = useRouter()
  const [statusIdx, setStatusIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = STATUS_LINES.length * STEP_MS

    // advance status lines
    const timers = STATUS_LINES.slice(1).map((_, i) =>
      setTimeout(() => setStatusIdx(i + 1), (i + 1) * STEP_MS)
    )

    // smooth progress bar
    const start = Date.now()
    let raf: number
    function tick() {
      const pct = Math.min(100, ((Date.now() - start) / total) * 100)
      setProgress(pct)
      if (pct < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // redirect after last line + 800ms
    const redirect = setTimeout(() => router.push('/terminal'), total + 800)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(redirect)
      cancelAnimationFrame(raf)
    }
  }, [router])

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: 46, fontWeight: 900, color: 'var(--tp)', letterSpacing: '-1.5px', margin: '0 0 28px' }}>
        FLUX
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--tp)', margin: '0 0 8px' }}>
        Calibrating your feed.
      </p>
      <p style={{ fontSize: 13, color: 'var(--tt)', margin: '0 0 36px' }}>
        Scoring signals against your priorities.
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 2,
          backgroundColor: 'var(--s4)',
          borderRadius: 99,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: 'var(--acc)',
            width: `${progress}%`,
            borderRadius: 99,
          }}
        />
      </div>

      {/* Status line */}
      <AnimatePresence mode="wait">
        <motion.p
          key={statusIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ fontSize: 13, color: 'var(--ts)', fontFamily: 'monospace', margin: 0 }}
        >
          {STATUS_LINES[statusIdx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    role: '',
    interests: [],
    trackingText: '',
    companiesText: '',
    calibrationRatings: {},
  })

  function next() { setStep(s => s + 1) }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>

        {step < 5 && <StepIndicator step={step} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {step === 1 && <Step1 onNext={next} />}
            {step === 2 && <Step2 data={data} setData={setData} onNext={next} />}
            {step === 3 && <Step3 onNext={next} />}
            {step === 4 && <Step4 data={data} setData={setData} onNext={next} />}
            {step === 5 && <Step5 />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
