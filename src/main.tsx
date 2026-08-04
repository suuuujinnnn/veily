import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import '@fontsource-variable/noto-sans-kr/wght.css'
import './styles/global.css'
import './styles/features.css'
import './styles/portal.css'
import './styles/fixes.css'
import './styles/modern.css'
import './styles/experience.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
