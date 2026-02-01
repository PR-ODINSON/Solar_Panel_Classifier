import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import RoleBasedRedirect from './components/RoleBasedRedirect.jsx'

// Authentication Pages
import SignIn from './pages/SignIn.jsx'
import Register from './pages/Register.jsx'
import Unauthorized from './pages/Unauthorized.jsx'
import NotFound from './pages/NotFound.jsx'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import UploadInfer from './pages/admin/UploadInfer.jsx'
import Inspections from './pages/admin/Inspections.jsx'
import InspectionDetail from './pages/admin/InspectionDetail.jsx'
import Defects from './pages/admin/Defects.jsx'
import DefectDetail from './pages/admin/DefectDetail.jsx'
import StaffManagement from './pages/admin/StaffManagement.jsx'
import MaintenanceTasks from './pages/admin/MaintenanceTasks.jsx'
import TaskObservations from './pages/admin/TaskObservations.jsx'

// Maintenance User Pages
import MaintenanceDashboard from './pages/maintenance/Dashboard.jsx'
import Profile from './pages/maintenance/Profile.jsx'
import TaskDetail from './pages/maintenance/TaskDetail.jsx'
import TasksList from './pages/maintenance/TasksList.jsx'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Root route with role-based redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/upload-infer"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <UploadInfer />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/inspections"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <Inspections />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/inspections/:id"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <InspectionDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/defects"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <Defects />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/defects/:id"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <DefectDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/staff"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <StaffManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/maintenance"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <MaintenanceTasks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/maintenance/:id/observations"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <TaskObservations />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Maintenance User Routes */}
            <Route
              path="/maintenance/dashboard"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <MaintenanceDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/tasks"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <TasksList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/tasks/:id"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <TaskDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/defects"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <Defects />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/defects/:id"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <DefectDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/settings"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
