import { ExternalLink, Link as LinkIcon, LockKeyhole, UserRound } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { couples } from '../../data/mockData'

export function PortalEntryPage() {
  const { coupleId = 'c1' } = useParams()
  return <Navigate to={`/portal/${coupleId}`} replace />
}