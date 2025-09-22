import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import RoleBasedRedirect from './components/RoleBasedRedirect.jsx'

// Authentication Pages
import SignIn from './pages/SignIn.jsx'
import Unauthorized from './pages/Unauthorized.jsx'
import NotFound from './pages/NotFound.jsx'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import UserManagement from './pages/admin/UserManagement.jsx'
import MaintenanceRequests from './pages/admin/MaintenanceRequests.jsx'
import Reports from './pages/admin/Reports.jsx'
import AdminSettings from './pages/admin/Settings.jsx'

// Maintenance User Pages
import MaintenanceDashboard from './pages/maintenance/Dashboard.jsx'
import MyTasks from './pages/maintenance/MyTasks.jsx'
import Profile from './pages/maintenance/Profile.jsx'
import HelpSupport from './pages/maintenance/HelpSupport.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Root route with role-based redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/maintenance-requests"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <MaintenanceRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminSettings />
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
                    <MyTasks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/profile"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/maintenance/help"
              element={
                <ProtectedRoute requiredRole="maintenance_staff">
                  <Layout>
                    <HelpSupport />
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
