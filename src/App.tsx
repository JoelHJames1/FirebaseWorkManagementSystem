import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { user, userRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin Dashboard Route (Protected and Role-Based) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Worker Dashboard Route (Protected and Role-Based) */}
            <Route
              path="/worker"
              element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
