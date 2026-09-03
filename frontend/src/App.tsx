import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// Lazy loaded pages for massive speed boost
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Scan = React.lazy(() => import('./pages/Scan'));
const Pantry = React.lazy(() => import('./pages/Pantry'));
const AiAssistant = React.lazy(() => import('./pages/AiAssistant'));
const ShoppingList = React.lazy(() => import('./pages/ShoppingList'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <Loader2 className="animate-spin text-blue-600" size={48} />
  </div>
);

// Placeholder components for the other routes
const Alerts = () => <div className="p-6 h-full flex flex-col items-center justify-center"><h1 className="text-2xl text-slate-400">Alerts Coming Soon...</h1></div>;
const Profile = () => <div className="p-6 h-full flex flex-col items-center justify-center"><h1 className="text-2xl text-slate-400">Profile Settings Coming Soon...</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scan" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Scan />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pantry" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Pantry />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-assistant" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <AiAssistant />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shopping-list" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ShoppingList />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Alerts />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
