import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewView from './components/OverviewView';
import TrapView from './components/TrapView';
import ReportsView from './components/ReportsView';
import LoginPage from './components/LoginPage';
import { USER_ROLES } from './data/authRoles';

export default function App() {
  // Authentication State: First user must login
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cicr_auth') === 'true';
  });

  const [currentUserRole, setCurrentUserRole] = useState(() => {
    const saved = sessionStorage.getItem('cicr_user_role');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const matched = USER_ROLES.find((r) => r.id === parsed.id);
        if (matched) return matched;
        return parsed;
      } catch (e) {
        return USER_ROLES[0];
      }
    }
    return USER_ROLES[0];
  });

  const [currentView, setCurrentView] = useState('overview');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogin = (role) => {
    setCurrentUserRole(role);
    setIsAuthenticated(true);
    sessionStorage.setItem('cicr_auth', 'true');
    sessionStorage.setItem('cicr_user_role', JSON.stringify(role));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cicr_auth');
    sessionStorage.removeItem('cicr_user_role');
  };

  const handleSelectDistrictFromOverview = (districtName) => {
    setDistrictFilter(districtName);
    setCurrentView('traps');
  };

  // If not authenticated, show clean dedicated Login Page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Once authenticated, show clean, expansive dashboard
  return (
    <div className="min-h-screen bg-[#f3f5f0] flex flex-col antialiased font-sans text-[#1c2826] relative">
      {/* Side Drawer Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUserRole={currentUserRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Balanced with comfortable breathing margins */}
      <main className="flex-1 w-full max-w-[1640px] mx-auto px-6 sm:px-8 lg:px-12 py-5 transition-all duration-300">
        <Header
          currentView={currentView}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          currentUserRole={currentUserRole}
          onLogout={handleLogout}
        />

        {currentView === 'overview' && (
          <OverviewView
            currentUserRole={currentUserRole}
            onSelectDistrict={handleSelectDistrictFromOverview}
          />
        )}

        {currentView === 'traps' && (
          <TrapView
            initialDistrictFilter={districtFilter}
            currentUserRole={currentUserRole}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView currentUserRole={currentUserRole} />
        )}
      </main>
    </div>
  );
}
