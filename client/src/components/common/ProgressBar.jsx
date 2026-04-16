export default function ProgressBar({ value, max = 10000, label }) {
  const safeValue = Number(value) || 0
  const pct = Math.min(Math.round((safeValue / max) * 100), 100)

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-slate-300">{label}</p>}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-linear-to-r from-red-400 via-red-500 to-rose-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">{pct}% of goal</p>
    </div>
  )
}
