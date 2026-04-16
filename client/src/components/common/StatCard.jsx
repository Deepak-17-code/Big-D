import Card from './Card'

export default function StatCard({ label, value, hint }) {
  return (
    <Card className="min-h-30">
      <p className="text-sm uppercase tracking-widest text-blue-200/90">{label}</p>
      <p className="mt-3 text-4xl font-bold text-slate-50">{value}</p>
      {hint && <p className="mt-2 text-sm text-sky-300">{hint}</p>}
    </Card>
  )
}
