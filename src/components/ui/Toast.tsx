import { CheckCircle2, Sparkles } from 'lucide-react'

export function Toast({ open, title, message, reward = false }: { open: boolean; title: string; message?: string; reward?: boolean }) {
  if (!open) return null
  return <div className={`toast app-toast ${reward ? 'app-toast--reward' : ''}`} role="status" aria-live="polite"><span>{reward ? <Sparkles size={17} /> : <CheckCircle2 size={17} />}</span><div><strong>{title}</strong>{message && <p>{message}</p>}</div></div>
}
