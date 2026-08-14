import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'
import './styles/features.css'
import './styles/portal.css'
import './styles/modern.css'
import './styles/experience.css'
import './styles/readability.css'
import './styles/calendar-enhancements.css'
import './styles/vendor-discovery.css'
import './styles/shared-vendor-calendar.css'
import './styles/vendor-reviews.css'
import './styles/merged-features.css'
import './styles/confirmed-requirements.css'
import './styles/client-taste.css'
import './styles/workspace-updates.css'
import './styles/venue-search.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
