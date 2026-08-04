import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PlannerLayout } from '../components/layout/PlannerLayout'
import { PortalLayout } from '../components/layout/PortalLayout'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { CommunityPage } from '../features/community/CommunityPage'
import { ContractsPage } from '../features/contracts/ContractsPage'
import { CoupleDetailPage } from '../features/couples/CoupleDetailPage'
import { CouplesPage } from '../features/couples/CouplesPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PortalPage } from '../features/portal/PortalPage'
import { VendorsPage } from '../features/vendors/VendorsPage'
import { DemoProvider } from './store'

export function App() {
  return (
    <HashRouter>
      <DemoProvider>
        <Routes>
          <Route element={<PlannerLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="couples" element={<CouplesPage />} />
            <Route path="couples/:id" element={<CoupleDetailPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="community" element={<CommunityPage />} />
          </Route>
          <Route path="portal" element={<PortalLayout />}>
            <Route path=":coupleId" element={<PortalPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DemoProvider>
    </HashRouter>
  )
}
