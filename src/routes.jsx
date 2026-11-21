import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import CitizenLayout from './layouts/CitizenLayout';
import ApplicationLayout from './layouts/ApplicationLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './layouts/RequireAuth';

const Home = lazy(() => import('./pages/public/Home'));
const Categories = lazy(() => import('./pages/public/Categories'));
const CategoryPage = lazy(() => import('./pages/public/CategoryPage'));
const SchemeCatalogue = lazy(() => import('./pages/public/SchemeCatalogue'));
const SchemeDetails = lazy(() => import('./pages/public/SchemeDetails'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const DesignSystem = lazy(() => import('./pages/public/DesignSystem'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/citizen/Dashboard'));
const Profile = lazy(() => import('./pages/citizen/Profile'));
const Settings = lazy(() => import('./pages/citizen/Settings'));
const SavedSchemes = lazy(() => import('./pages/citizen/SavedSchemes'));
const HelperWorkspace = lazy(() => import('./pages/citizen/HelperWorkspace'));
const HelperIntro = lazy(() => import('./pages/public/HelperIntro'));
const ApplicationJourney = lazy(() => import('./pages/application/ApplicationJourney'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* A. Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="schemes" element={<SchemeCatalogue />} />
        <Route path="schemes/:id" element={<SchemeDetails />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="helper" element={<HelperIntro />} />
        <Route path="design-system" element={<DesignSystem />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* C. Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* D. Citizen workspace */}
      <Route element={<RequireAuth />}>
        <Route element={<CitizenLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="saved" element={<SavedSchemes />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="helper/workspace" element={<HelperWorkspace />} />
        </Route>

        {/* Application preparation journey */}
        <Route path="apply/:schemeId" element={<ApplicationLayout />}>
          <Route index element={<Navigate to="eligibility" replace />} />
          <Route path="eligibility" element={<ApplicationJourney />} />
          <Route path="results" element={<ApplicationJourney />} />
          <Route path="result" element={<ApplicationJourney />} />
          <Route path="documents" element={<ApplicationJourney />} />
          <Route path="upload" element={<ApplicationJourney />} />
          <Route path="review" element={<ApplicationJourney />} />
          <Route path="corrections" element={<ApplicationJourney />} />
          <Route path="final" element={<ApplicationJourney />} />
          <Route path="packet" element={<ApplicationJourney />} />
          <Route path="tracker" element={<ApplicationJourney />} />
        </Route>
      </Route>

      {/* E. Administration */}
      <Route element={<RequireAuth role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/schemes" element={<AdminPanel />} />
          <Route path="admin/schemes/new" element={<AdminPanel />} />
          <Route path="admin/schemes/:schemeId/edit" element={<AdminPanel />} />
          <Route path="admin/schemes/:schemeId/history" element={<AdminPanel />} />
          <Route path="admin/schemes/:schemeId/sources" element={<AdminPanel />} />
          <Route path="admin/sources" element={<AdminPanel />} />
          <Route path="admin/rulebook" element={<AdminPanel />} />
          <Route path="admin/rulebook/:ruleId/history" element={<AdminPanel />} />
          <Route path="admin/policy-changes" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}
