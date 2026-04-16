import { CheckCircle2, Info } from 'lucide-react'

export default function ToastMessage({ message, type = 'success', onClose }) {
  if (!message) {
    return null
  }

  const isSuccess = type === 'success'

  return (
    <div className="fixed right-4 top-4 z-60 max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm ${
          isSuccess
            ? 'border-emerald-500/50 bg-emerald-950/85 text-emerald-100'
            : 'border-blue-500/50 bg-blue-950/85 text-blue-100'
        }`}
      >
        <span className="mt-0.5">
          {isSuccess ? <CheckCircle2 size={18} /> : <Info size={18} />}
        </span>
        <p className="flex-1 text-sm">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-0.5 text-xs opacity-80 transition hover:opacity-100"
        >
          Close
        </button>
      </div>
    </div>
  )
}