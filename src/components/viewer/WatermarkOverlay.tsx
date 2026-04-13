interface WatermarkOverlayProps {
  email: string
  ip?: string
}

export function WatermarkOverlay({ email, ip }: WatermarkOverlayProps) {
  const text = ip ? `${email} • ${ip}` : email

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 10 }}
    >
      {/* Repeating watermark pattern */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute whitespace-nowrap"
          style={{
            top: `${(i % 4) * 25 + 5}%`,
            left: `${Math.floor(i / 4) * 35 - 5}%`,
            transform: 'rotate(-45deg)',
            opacity: 0.12,
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e40af',
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          {text}
        </div>
      ))}
    </div>
  )
}
