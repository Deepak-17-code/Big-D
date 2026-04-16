const socialLinkFields = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'website', label: 'Website' },
]

export default function SocialLinks({ socialLinks = {}, emptyMessage, className = '' }) {
  const activeLinks = socialLinkFields.filter((field) => String(socialLinks?.[field.key] || '').trim())

  if (!activeLinks.length) {
    return emptyMessage ? <p className={`text-sm text-slate-400 ${className}`.trim()}>{emptyMessage}</p> : null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {activeLinks.map((field) => {
        const value = String(socialLinks?.[field.key] || '').trim()

        return (
          <a
            key={field.key}
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-700/70 px-3 py-1.5 text-xs text-slate-200 transition hover:border-blue-500/60 hover:bg-slate-900/60 hover:text-blue-200"
          >
            {field.label}
          </a>
        )
      })}
    </div>
  )
}