import { Navigate, Route, Routes } from 'react-router-dom'
import { BackofficeLayout } from '@/app/layouts/backoffice-layout'
import { ClientLayout } from '@/app/layouts/client-layout'
import { PublicLayout } from '@/app/layouts/public-layout'
import { ClientRoute, StaffRoute } from '@/app/router/guards'
import { BackofficeDashboardPage } from '@/pages/backoffice/dashboard-page'
import { BackofficeFileDetailPage } from '@/pages/backoffice/file-detail-page'
import { BackofficeFilesPage } from '@/pages/backoffice/files-page'
import { BackofficeVehicleFormPage } from '@/pages/backoffice/vehicle-form-page'
import { BackofficeVehiclePreviewPage } from '@/pages/backoffice/vehicle-preview-page'
import { BackofficeVehiclesPage } from '@/pages/backoffice/vehicles-page'
import { ClientDashboardPage } from '@/pages/client/dashboard-page'
import { ClientFavoritesPage } from '@/pages/client/favorites-page'
import { ClientFilesPage } from '@/pages/client/files-page'
import { ClientProfilePage } from '@/pages/client/profile-page'
import { FileTrackingPage } from '@/pages/client/file-tracking-page'
import { NewFilePage } from '@/pages/client/new-file-page'
import { UploadDocumentsPage } from '@/pages/client/upload-documents-page'
import { LegalPage } from '@/pages/public/legal-page'
import { HomePage } from '@/pages/public/home-page'
import { ContactPage } from '@/pages/public/contact-page'
import { LoginPage } from '@/pages/public/login-page'
import { RegisterPage } from '@/pages/public/register-page'
import { PrivacyPage } from '@/pages/public/privacy-page'
import { VehicleDetailPage } from '@/pages/public/vehicle-detail-page'
import { VehiclesPage } from '@/pages/public/vehicles-page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/favorites" element={<Navigate to="/app/favoris" replace />} />
        <Route path="/app/favorites" element={<Navigate to="/app/favoris" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/compare" element={<Navigate to="/vehicles" replace />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route element={<ClientRoute />}>
        <Route element={<ClientLayout />}>
          <Route path="/app/dashboard" element={<ClientDashboardPage />} />
          <Route path="/app/profile" element={<ClientProfilePage />} />
          <Route path="/app/favoris" element={<ClientFavoritesPage />} />
          <Route path="/app/favorites" element={<Navigate to="/app/favoris" replace />} />
          <Route path="/app/files" element={<ClientFilesPage />} />
          <Route path="/app/files/new" element={<NewFilePage />} />
          <Route path="/app/files/new/:vehicleId" element={<NewFilePage />} />
          <Route path="/app/files/:fileId/edit" element={<NewFilePage />} />
          <Route path="/app/files/:fileId" element={<FileTrackingPage />} />
          <Route path="/app/files/:fileId/upload" element={<UploadDocumentsPage />} />
        </Route>
      </Route>

      <Route element={<StaffRoute />}>
        <Route element={<BackofficeLayout />}>
          <Route path="/backoffice" element={<Navigate to="/backoffice/dashboard" replace />} />
          <Route path="/backoffice/dashboard" element={<BackofficeDashboardPage />} />
          <Route path="/backoffice/vehicles" element={<BackofficeVehiclesPage />} />
          <Route path="/backoffice/vehicles/new" element={<BackofficeVehicleFormPage />} />
          <Route path="/backoffice/vehicles/:vehicleId/edit" element={<BackofficeVehicleFormPage />} />
          <Route path="/backoffice/vehicles/:vehicleId/preview" element={<BackofficeVehiclePreviewPage />} />
          <Route path="/backoffice/files" element={<BackofficeFilesPage />} />
          <Route path="/backoffice/files/:fileId" element={<BackofficeFileDetailPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
