import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ScanLine, List, Bell, User, LogOut, ChefHat } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={24} /> },
    { path: '/scan', label: 'Scan', icon: <ScanLine size={24} /> },
    { path: '/pantry', label: 'Pantry', icon: <List size={24} /> },
    { path: '/ai-assistant', label: 'AI Chef', icon: <ChefHat size={24} /> },
    { path: '/alerts', label: 'Alerts', icon: <Bell size={24} /> },
    { path: '/profile', label: 'Profile', icon: <User size={24} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">SmartPantry</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <LogOut size={24} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              location.pathname === item.path
                ? 'text-blue-600'
                : 'text-slate-500'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
