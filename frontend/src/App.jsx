import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import ToastContainer from './components/ui/Toast';

// Core synchronous layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Lazy-loaded pages for high-performance code-splitting
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const OAuthSuccess = lazy(() => import('./pages/Auth/OAuthSuccess'));

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const ResumePage = lazy(() => import('./pages/Resume/ResumePage'));
const AssessmentPage = lazy(() => import('./pages/Assessment/AssessmentPage'));
const SkillGraphPage = lazy(() => import('./pages/SkillGraph/SkillGraphPage'));
const SkillGapPage = lazy(() => import('./pages/SkillGap/SkillGapPage'));
const JobsPage = lazy(() => import('./pages/Jobs/JobsPage'));
const JobDetailsPage = lazy(() => import('./pages/Jobs/JobDetailsPage'));
const ApplicationsPage = lazy(() => import('./pages/Applications/ApplicationsPage'));
const RoadmapPage = lazy(() => import('./pages/Roadmap/RoadmapPage'));
const ProgressPage = lazy(() => import('./pages/Progress/ProgressPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));

const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('./pages/Admin/AdminUserDetail'));
const AdminSkills = lazy(() => import('./pages/Admin/AdminSkills'));
const AdminJobs = lazy(() => import('./pages/Admin/AdminJobs'));
const AdminAnalytics = lazy(() => import('./pages/Admin/AdminAnalytics'));
const AdminActivity = lazy(() => import('./pages/Admin/AdminActivity'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-navy/90 text-white">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
      <div className="absolute w-4 h-4 rounded-full bg-accent animate-pulse"></div>
    </div>
    <p className="mt-4 text-xs tracking-wider uppercase font-semibold text-slate/80">Loading SkillForge...</p>
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/skill-graph" element={<SkillGraphPage />} />
              <Route path="/skill-gaps" element={<SkillGapPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/skills" element={<AdminSkills />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/activity" element={<AdminActivity />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center text-slate">
                Page not found.
              </div>
            }
          />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
