import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { Layout, SuperAdminOnly } from './components/Layout';
import { AuthProvider } from './context/auth';
import { AdminsPage, AuditPage } from './pages/AdminsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ContactsPage } from './pages/ContactsPage';
import { DashboardPage } from './pages/DashboardPage';
import { GalleryPage } from './pages/GalleryPage';
import { HostessesPage } from './pages/HostessesPage';
import { ChangePasswordPage, LoginPage } from './pages/LoginPage';
import { MessagesPage } from './pages/MessagesPage';
import { PlanningPage } from './pages/PlanningPage';
import { QuotesPage } from './pages/QuotesPage';
import { SiteImagesPage } from './pages/SiteImagesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/mot-de-passe" element={<ChangePasswordPage />} />
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="devis" element={<QuotesPage />} />
            <Route path="candidatures" element={<ApplicationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="planning" element={<PlanningPage />} />
            <Route path="hotesses" element={<HostessesPage />} />
            <Route path="galerie" element={<GalleryPage />} />
            <Route path="images" element={<SiteImagesPage />} />
            <Route path="coordonnees" element={<ContactsPage />} />
            <Route path="administrateurs" element={<SuperAdminOnly><AdminsPage /></SuperAdminOnly>} />
            <Route path="journal" element={<SuperAdminOnly><AuditPage /></SuperAdminOnly>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
