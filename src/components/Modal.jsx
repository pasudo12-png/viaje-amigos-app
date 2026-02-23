import { useEffect } from 'react'

export default function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg p-6 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}