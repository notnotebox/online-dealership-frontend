import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/public-layout'
import { HomePage } from '@/pages/public/home-page'
import { ContactPage } from '@/pages/public/contact-page'
import { LoginPage } from '@/pages/public/login-page'
import { RegisterPage } from '@/pages/public/register-page'
import { SimpleTextPage } from '@/pages/public/simple-text-page'
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
        <Route path="/forgot-password" element={<SimpleTextPage title="Mot de passe oublie" />} />
        <Route path="/favorites" element={<SimpleTextPage title="Favoris" />} />
        <Route path="/compare" element={<SimpleTextPage title="Comparateur" />} />
        <Route path="/legal" element={<SimpleTextPage title="Mentions legales" />} />
        <Route path="/privacy" element={<SimpleTextPage title="Politique de confidentialite" />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  )
}
