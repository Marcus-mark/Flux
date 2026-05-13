'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function anim(delay: number) {
  return {
    initial:    { opacity: 0, y: 8 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' },
  }
}

export default function EntryPage() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: 'var(--void)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.p
        {...anim(0)}
        style={{ fontSize: 46, fontWeight: 900, color: 'var(--tp)', letterSpacing: '-1.5px', margin: '0 0 20px' }}
      >
        FLUX
      </motion.p>

      <motion.p
        {...anim(0.1)}
        style={{ fontSize: 19, fontWeight: 500, color: 'var(--ts)', lineHeight: 1.45, maxWidth: 380, textAlign: 'center', margin: '0 0 32px' }}
      >
        Define what you track. FLUX will surface what matters.
      </motion.p>

      <motion.div {...anim(0.2)}>
        <Link
          href="/onboarding"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'inline-block',
            backgroundColor: hovered ? 'rgba(92,92,240,0.9)' : 'var(--acc)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            padding: '11px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'background-color 0.12s ease',
          }}
        >
          Get started
        </Link>
      </motion.div>

      <motion.p
        {...anim(0.45)}
        style={{ fontSize: 10, color: 'var(--td)', margin: '48px 0 0' }}
      >
        Private by default · No noise · Built for decisions
      </motion.p>
    </div>
  )
}
