export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap" aria-label={label ?? `진행률 ${value}%`}>
      <div className="progress-track">
        <span className="progress-value" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {label && <span className="progress-label">{label}</span>}
    </div>
  )
}
