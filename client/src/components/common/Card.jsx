export default function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`glass-card ${className}`}>
      {(title || subtitle || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-50">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-300/90">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
