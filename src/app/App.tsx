import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PlannerLayout } from '../components/layout/PlannerLayout'
import { PortalLayout } from '../components/layout/PortalLayout'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { CommunityPage } from '../features/community/CommunityPage'
import { PublicConsultationCardPage } from '../features/consultation/PublicConsultationCardPage'
import { CoupleDetailPage } from '../features/couples/CoupleDetailPage'
import { CouplesPage } from '../features/couples/CouplesPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PortalPage } from '../features/portal/PortalPage'
import { PortalEntryPage } from '../features/portal/PortalEntryPage'
import { VendorsPage } from '../features/vendors/VendorsPage'
import { VendorDetailPage } from '../features/vendors/VendorDetailPage'
import { PartnerApprovalMockPage } from '../features/partner/PartnerApprovalMockPage'
import { OrdersPage } from '../features/orders/OrdersPage'
import { DemoProvider } from './store'

export function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Routes>
          <Route element={<PlannerLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="couples" element={<CouplesPage />} />
            <Route path="couples/:id" element={<CoupleDetailPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="vendors/:vendorId" element={<VendorDetailPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="contracts" element={<Navigate to="/couples/c1?tab=finance" replace />} />
            <Route path="community" element={<CommunityPage />} />
          </Route>
          <Route path="client/:coupleId" element={<PortalEntryPage />} />
          <Route path="consultation/:coupleId" element={<PublicConsultationCardPage />} />
          <Route path="portal" element={<PortalLayout />}>
            <Route path=":coupleId/:section?" element={<PortalPage />} />
          </Route>
          <Route path="partner/approvals" element={<PartnerApprovalMockPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  )
}
