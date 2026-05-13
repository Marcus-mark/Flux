'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Archive, Bell, ChevronDown, ChevronRight,
  CircleUser, Keyboard, LogOut, Radio, Search, Sliders, User, X,
} from 'lucide-react'
import TierBadge from '@/components/shared/TierBadge'
import type { Briefing, Signal } from '@/lib/types'

type OpenPanel = null | 'keyboard' | 'notifications' | 'profile'

export interface CommandBarProps {
  signals: Signal[]
  briefings: Record<string, Briefing>
  showArchive: boolean
  searchRef: React.RefObject<HTMLInputElement | null>
  onSignalSelect: (id: string) => void
  onArchiveOpen: () => void
}

const SHORTCUTS: { key: string; action: string }[] = [
  { key: 'J / K', action: 'Navigate signals up / down'  },
  { key: 'S',     action: 'Save active briefing'        },
  { key: 'D',     action: 'Dismiss active briefing'     },
  { key: 'A',     action: 'Mark as acted'               },
  { key: 'C',     action: 'Open / close context drawer' },
  { key: '/',     action: 'Focus search'                },
  { key: 'Esc',   action: 'Close any open panel'        },
]

function Sep() {
  return <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)', flexShrink: 0 }} />
}

function IconBtn({
  children, onClick, btnRef, active,
}: {
  children: React.ReactNode
  onClick?: () => void
  btnRef?: React.RefObject<HTMLButtonElement | null>
  active?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer',
        background: hovered || active ? 'var(--s3)' : 'none',
        color: hovered || active ? 'var(--tp)' : 'var(--tt)',
        transition: 'all 0.12s ease', flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function NavLink({ icon, label, isActive, onClick }: {
  icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, padding: '4px 8px',
        borderRadius: 6, border: 'none', cursor: 'pointer',
        color: isActive ? 'var(--at)' : hovered ? 'var(--tp)' : 'var(--tt)',
        background: hovered || isActive ? 'var(--s3)' : 'transparent',
        transition: 'all 0.12s ease', flexShrink: 0,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function ProfileMenuItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', height: 36, padding: '0 16px',
        gap: 10, cursor: 'pointer',
        backgroundColor: hovered ? 'var(--s3)' : 'transparent',
        transition: 'background-color 0.12s ease',
      }}
    >
      <span style={{ color: 'var(--tt)', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{
        fontSize: 12, flex: 1,
        color: hovered && danger ? 'var(--crit)' : 'var(--ts)',
        transition: 'color 0.12s ease',
      }}>
        {label}
      </span>
      <ChevronRight size={12} style={{ color: 'var(--tt)', flexShrink: 0 }} />
    </div>
  )
}

export default function CommandBar({
  signals, briefings, showArchive, searchRef, onSignalSelect, onArchiveOpen,
}: CommandBarProps) {
  const [query, setQuery]                 = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [openPanel, setOpenPanel]         = useState<OpenPanel>(null)
  const [domainTooltip, setDomainTooltip] = useState(false)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [notifications, setNotifications] = useState<Array<{ signal: Signal; read: boolean }>>(() =>
    signals
      .filter(s => s.tier === 'CRITICAL' || s.tier === 'HIGH')
      .slice(0, 2)
      .map(s => ({ signal: s, read: false }))
  )
  const hasUnread = notifications.some(n => !n.read)

  const panelContentRef    = useRef<HTMLDivElement>(null)
  const kbTriggerRef       = useRef<HTMLButtonElement>(null)
  const bellTriggerRef     = useRef<HTMLButtonElement>(null)
  const profileTriggerRef  = useRef<HTMLButtonElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return signals
      .filter(s => {
        if (s.state === 'dismissed') return false
        const b = briefings[s.id]
        return (
          s.headline.toLowerCase().includes(q) ||
          s.source.toLowerCase().includes(q) ||
          (b?.openingStatement?.toLowerCase().includes(q) ?? false)
        )
      })
      .slice(0, 8)
  }, [query, signals, briefings])

  useEffect(() => {
    if (!openPanel) return
    function handler(e: MouseEvent) {
      const t = e.target as Node
      if (panelContentRef.current?.contains(t))   return
      if (kbTriggerRef.current?.contains(t))      return
      if (bellTriggerRef.current?.contains(t))    return
      if (profileTriggerRef.current?.contains(t)) return
      setOpenPanel(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openPanel])

  useEffect(() => {
    if (!query) return
    function handler(e: MouseEvent) {
      if (!searchContainerRef.current?.contains(e.target as Node)) setQuery('')
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenPanel(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function togglePanel(p: Exclude<OpenPanel, null>) {
    setOpenPanel(o => o === p ? null : p)
  }

  function handleDomainEnter() {
    tooltipTimer.current = setTimeout(() => setDomainTooltip(true), 200)
  }
  function handleDomainLeave() {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    setDomainTooltip(false)
  }

  function handleResultClick(id: string) {
    setQuery('')
    onSignalSelect(id)
  }

  function handleNotifClick(signal: Signal) {
    setNotifications(prev => prev.map(n => n.signal.id === signal.id ? { ...n, read: true } : n))
    setOpenPanel(null)
    onSignalSelect(signal.id)
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <header style={{
      flexShrink: 0, display: 'flex', alignItems: 'center',
      height: 56, padding: '0 24px', gap: 12,
      backgroundColor: 'var(--s1)', borderBottom: '1px solid var(--border)',
    }}>

      {/* FLUX logo + wordmark */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0, textDecoration: 'none', lineHeight: 1,
      }}>
        <svg width="24" height="24" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M35.8926 16.2699C37.0348 15.8513 38.2814 15.8974 39.4306 16.5609C40.4259 17.1356 40.9236 18.0751 41.1719 18.8724C41.4214 19.674 41.4884 20.5411 41.4795 21.3246C41.4615 22.8982 41.1285 24.5715 40.7969 25.7308C40.4928 26.7924 39.386 27.4066 38.3242 27.1029C37.2625 26.7989 36.6475 25.692 36.9511 24.6302C37.2171 23.7003 37.4677 22.394 37.4804 21.2787C37.4868 20.7179 37.4304 20.3122 37.3525 20.0619C37.3459 20.0406 37.3369 20.0226 37.331 20.0062C37.315 20.0104 37.2942 20.0163 37.2685 20.0257C37.0693 20.0989 36.697 20.3288 36.1933 20.8959C35.3646 21.829 34.4852 23.3285 33.6797 25.2367C34.9962 26.4854 35.9834 27.8115 36.5742 29.2377C37.3406 31.0883 37.3862 32.9765 36.8095 34.8226C36.0224 37.3419 34.3929 38.896 32.374 39.1556C30.5934 39.3845 28.6555 38.4845 27.9726 36.7367C27.1484 34.6264 27.1133 32.0011 28.9531 26.475C27.9751 25.6945 26.9473 24.9817 25.125 24.2386C21.5532 22.7822 20.0267 23.6586 19.5166 24.2582C18.896 24.9878 18.7333 26.4161 19.6025 27.7562C20.2553 28.7621 21.3547 29.0786 22.4375 29.4662C23.4771 29.8386 24.0177 30.984 23.6455 32.0238C23.2731 33.0634 22.1286 33.6039 21.0888 33.2318C20.4192 32.9922 17.7829 32.3037 16.2451 29.933C14.6232 27.4323 14.4719 24.0141 16.4687 21.6664C18.5764 19.1885 22.274 18.7559 26.6357 20.5345C28.3199 21.2213 29.5117 21.9287 30.4707 22.6087C31.2745 20.8927 32.1949 19.3737 33.2021 18.2396C33.938 17.4111 34.8347 16.6578 35.8926 16.2699ZM32.1845 29.5521C31.1596 33.1409 31.3958 34.4454 31.6533 35.1625C31.7041 35.1841 31.7788 35.1997 31.8642 35.1888C31.9445 35.1784 32.0903 35.1385 32.2773 34.9584C32.4741 34.7686 32.7579 34.3799 32.9922 33.6302C33.3014 32.6401 33.2717 31.7177 32.8789 30.7689C32.7199 30.385 32.4921 29.9789 32.1845 29.5521Z" fill="#5B5BF0"/>
        </svg>
        <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--tp)', letterSpacing: '-0.5px', lineHeight: 1 }}>
          FLUX
        </span>
      </Link>

      {/* Search */}
      <div ref={searchContainerRef} style={{ position: 'relative', flexShrink: 0 }}>
        <motion.div
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
            height: 32, backgroundColor: 'var(--s3)', borderRadius: 8, width: 200,
          }}
          animate={{ width: searchFocused ? 260 : 200 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Search size={12} style={{ color: 'var(--tt)', flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search signals..."
            style={{
              flex: 1, minWidth: 0, background: 'transparent',
              fontSize: 12, color: 'var(--ts)', border: 'none', outline: 'none',
            }}
          />
        </motion.div>

        {query.length >= 1 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4,
            minWidth: 320, maxHeight: 360, overflowY: 'auto',
            backgroundColor: 'var(--s2)', border: '1px solid var(--border)',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 200,
          }}>
            {searchResults.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--tt)', textAlign: 'center', padding: 16, margin: 0 }}>
                No results found
              </p>
            ) : searchResults.map(s => (
              <div
                key={s.id}
                onClick={() => handleResultClick(s.id)}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--s3)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <TierBadge tier={s.tier} />
                  <span style={{
                    fontSize: 13, color: 'var(--tp)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.headline}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--tt)', fontFamily: 'monospace' }}>
                  {s.source} · {s.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Domain pill */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onMouseEnter={handleDomainEnter}
          onMouseLeave={handleDomainLeave}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 12px', fontSize: 12, fontWeight: 500,
            color: 'var(--ts)', backgroundColor: 'var(--s2)',
            border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--acc)', flexShrink: 0 }} />
          AI Product Launches
          <ChevronDown size={12} style={{ color: 'var(--tt)' }} />
        </button>

        {domainTooltip && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--s3)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 12px', fontSize: 11, color: 'var(--ts)',
            whiteSpace: 'nowrap', zIndex: 300, pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '6px solid var(--s3)',
            }} />
            Only AI product launches available in v1. More domains coming soon.
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <NavLink icon={<Archive size={13} />} label="Archive" isActive={showArchive} onClick={onArchiveOpen} />
        <NavLink icon={<Radio size={13} />}   label="Sources" />

        <Sep />

        <IconBtn btnRef={kbTriggerRef} onClick={() => togglePanel('keyboard')} active={openPanel === 'keyboard'}>
          <Keyboard size={16} />
        </IconBtn>

        <IconBtn btnRef={bellTriggerRef} onClick={() => togglePanel('notifications')} active={openPanel === 'notifications'}>
          <div style={{ position: 'relative', lineHeight: 0 }}>
            <Bell size={16} />
            {hasUnread && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                transform: 'translate(30%, -30%)',
                width: 7, height: 7, borderRadius: '50%',
                backgroundColor: 'var(--crit)',
              }} />
            )}
          </div>
        </IconBtn>

        <Sep />

        <IconBtn btnRef={profileTriggerRef} onClick={() => togglePanel('profile')} active={openPanel === 'profile'}>
          <CircleUser size={16} />
          <ChevronDown size={12} />
        </IconBtn>
      </div>

      {/* ── Keyboard shortcuts panel ── */}
      {openPanel === 'keyboard' && (
        <div ref={panelContentRef} style={{
          position: 'fixed', top: 56, right: 16, width: 320,
          backgroundColor: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          zIndex: 150, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tp)' }}>Keyboard shortcuts</span>
            <button onClick={() => setOpenPanel(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, color: 'var(--tt)', display: 'flex',
            }}>
              <X size={14} />
            </button>
          </div>
          {SHORTCUTS.map((s, i) => (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 16px',
              borderBottom: i < SHORTCUTS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                fontSize: 11, fontFamily: 'monospace', color: 'var(--at)',
                backgroundColor: 'var(--s3)', borderRadius: 4, padding: '2px 7px',
              }}>
                {s.key}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ts)' }}>{s.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Notifications panel ── */}
      {openPanel === 'notifications' && (
        <div ref={panelContentRef} style={{
          position: 'fixed', top: 56, right: 16, width: 340,
          backgroundColor: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          zIndex: 150, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tp)' }}>Notifications</span>
            <button onClick={markAllRead} style={{
              fontSize: 11, color: 'var(--at)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--tt)', textAlign: 'center', padding: 24, margin: 0 }}>
              No new notifications
            </p>
          ) : notifications.map((n, i) => (
            <div
              key={n.signal.id}
              onClick={() => handleNotifClick(n.signal)}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--s4)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = n.read ? 'var(--s2)' : 'var(--s3)'}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                backgroundColor: n.read ? 'var(--s2)' : 'var(--s3)',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background-color 0.12s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <TierBadge tier={n.signal.tier} />
                <span style={{
                  fontSize: 13, color: 'var(--ts)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {n.signal.headline}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--tt)', fontFamily: 'monospace' }}>
                {n.signal.source} · {n.signal.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Profile dropdown ── */}
      {openPanel === 'profile' && (
        <div ref={panelContentRef} style={{
          position: 'fixed', top: 56, right: 16, width: 220,
          backgroundColor: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          zIndex: 150, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--acc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'var(--tp)', flexShrink: 0,
              }}>
                M
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--tp)', margin: 0 }}>Mark</p>
                <p style={{ fontSize: 11, color: 'var(--tt)', margin: 0 }}>Founder / Builder</p>
              </div>
            </div>
          </div>
          <ProfileMenuItem icon={<User size={16} />}    label="Profile settings"   />
          <ProfileMenuItem icon={<Radio size={16} />}   label="Domain & sources"   />
          <ProfileMenuItem icon={<Sliders size={16} />} label="Relevance settings" />
          <ProfileMenuItem
            icon={<Keyboard size={16} />}
            label="Keyboard shortcuts"
            onClick={() => setOpenPanel('keyboard')}
          />
          <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
          <ProfileMenuItem icon={<LogOut size={16} />} label="Sign out" danger />
        </div>
      )}
    </header>
  )
}
