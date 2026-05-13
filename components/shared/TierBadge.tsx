interface TierBadgeProps {
  tier: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  score?: number
}

const tierStyles: Record<TierBadgeProps['tier'], { color: string; background: string }> = {
  CRITICAL: { color: 'var(--crit)', background: 'rgba(232,69,95,0.14)' },
  HIGH:     { color: 'var(--high)', background: 'rgba(245,166,35,0.14)' },
  MEDIUM:   { color: 'var(--med)',  background: 'rgba(59,130,246,0.14)' },
}

export default function TierBadge({ tier, score }: TierBadgeProps) {
  const { color, background } = tierStyles[tier]

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span
        style={{
          color,
          background,
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: 2,
          textTransform: 'uppercase',
          padding: '2px 7px',
          borderRadius: 3,
        }}
      >
        {tier}
      </span>
      {score !== undefined && (
        <span
          style={{
            color: 'var(--tp)',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          {score}
        </span>
      )}
    </span>
  )
}
