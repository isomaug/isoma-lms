import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import GlobalPopup from "./components/GlobalPopup";
import PortalLayout from "./components/layout/PortalLayout";
import DashboardHome from "./pages/portal/DashboardHome";
import TenantWorkspace from "./pages/portal/TenantWorkspace";
import CurriculumTemplatesPage from "./pages/portal/CurriculumTemplatesPage";
import LoginPage from "./pages/auth/LoginPage";
import {
  SchoolsPage,
  CategoriesPage,
  UsersPage,
  InvoicesPage,
  DomainsPage,
  SettingsPage,
} from "./pages/landlord/LandlordPages";

const CoursesIndex = lazy(() => import("./pages/courses/catalog/CoursesIndex"));
const CourseLanding = lazy(() => import("./pages/courses/catalog/CourseLanding"));
const CourseLearningEntry = lazy(() => import("./pages/courses/learning/CourseLearningEntry"));
const MyLearning = lazy(() => import("./pages/courses/learning/MyLearning"));
const PastPaperReader = lazy(() => import("./pages/courses/materials/PastPaperReader"));
const LessonPlanEditor = lazy(() => import("./pages/courses/materials/LessonPlanEditor"));
const VerifyCertificate = lazy(() => import("./pages/courses/verification/VerifyCertificate"));

const DashboardCourses = lazy(() => import("./pages/dashboard/cohorts/DashboardCourses"));
const DashboardCohorts = lazy(() => import("./pages/dashboard/cohorts/DashboardCohorts"));
const DashboardMyCohorts = lazy(() => import("./pages/dashboard/cohorts/DashboardMyCohorts"));
const DashboardInstructors = lazy(() => import("./pages/dashboard/cohorts/DashboardInstructors"));
const DashboardCertificates = lazy(() => import("./pages/dashboard/cohorts/DashboardCertificates"));
const InstructorPastPapers = lazy(() => import("./pages/dashboard/cohorts/InstructorPastPapers"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-sm text-gray-500">
      Loading portal...
    </div>
  );
}

function ModeHome() {
  const { appMode } = useAuth();
  return appMode === "tenant" ? <TenantWorkspace /> : <DashboardHome />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <BrowserRouter>
              <GlobalPopup />
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<PortalLayout />}>
                    <Route path="/" element={<ModeHome />} />

                    {/* Landlord ERP routes (:5176 / isomaug.com) */}
                    <Route path="/schools" element={<SchoolsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/domains" element={<DomainsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Tenant Workspace & Shared LMS routes (:5177 / *.isomaug.com / learn.isomaug.com) */}
                    <Route path="/onboarding" element={<TenantWorkspace onboarding />} />
                    <Route path="/courses" element={<CurriculumTemplatesPage />} />
                    <Route path="/catalog" element={<CoursesIndex />} />
                    <Route path="/courses/:slug" element={<CourseLanding />} />
                    <Route path="/courses/:slug/learn" element={<CourseLearningEntry />} />
                    <Route path="/courses/:slug/past-papers/:paperId" element={<PastPaperReader />} />
                    <Route path="/courses/:slug/lesson-plan/:lessonId" element={<LessonPlanEditor />} />
                    <Route path="/my-learning" element={<MyLearning />} />
                    <Route path="/verify" element={<VerifyCertificate />} />
                    <Route path="/verify/:code" element={<VerifyCertificate />} />
                    <Route path="/verify-certificate" element={<VerifyCertificate />} />
                    <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
                    <Route path="/dashboard/courses" element={<DashboardCourses />} />
                    <Route path="/dashboard/cohorts" element={<DashboardCohorts />} />
                    <Route path="/dashboard/my-cohorts" element={<DashboardMyCohorts />} />
                    <Route path="/dashboard/instructors" element={<DashboardInstructors />} />
                    <Route path="/dashboard/certificates" element={<DashboardCertificates />} />
                    <Route path="/dashboard/past-papers" element={<InstructorPastPapers />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
