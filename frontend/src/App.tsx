import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Pantry from './pages/Pantry';
import AiAssistant from './pages/AiAssistant';
import ShoppingList from './pages/ShoppingList';

// Placeholder components for the other routes
const Alerts = () => <div className="p-6 h-full flex flex-col items-center justify-center"><h1 className="text-2xl text-slate-400">Alerts Coming Soon...</h1></div>;
const Profile = () => <div className="p-6 h-full flex flex-col items-center justify-center"><h1 className="text-2xl text-slate-400">Profile Settings Coming Soon...</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
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

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
