import React, { useEffect } from 'react';
import { X, LayoutDashboard, Eye, FileText, ChevronRight, LogOut } from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  isOpen,
  onClose,
  currentUserRole,
  onLogout,
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'traps', label: 'Trap View', icon: Eye },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  // Sanitize name and designation in case of stale cache
  const officerName =
    currentUserRole?.id === 'central_directorate'
      ? 'Dr. K. Rameash'
      : currentUserRole?.name || 'Officer Profile';

  const officerDesignation =
    currentUserRole?.id === 'central_directorate'
      ? 'Principal Scientist, ICAR-CICR'
      : (currentUserRole?.designation || '').replace(
          /National Project Directorate/gi,
          'Principal Scientist, ICAR-CICR'
        );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-out Left Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#145334] text-white flex flex-col justify-between p-6 shadow-2xl transition-transform duration-300 ease-in-out transform select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header & Profile naturally aligned directly in sidebar (Matching Image 2) */}
          <div className="flex items-center justify-between pb-5 border-b border-white/15">
            <div className="flex items-center gap-3.5">
              <img
                src="/cicr-logo.png"
                alt="CICR Emblem"
                className="w-12 h-12 rounded-full object-cover shadow-sm bg-white shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs text-white/80 font-medium leading-tight">
                  Signed in as,
                </div>
                <div className="text-sm font-bold text-white tracking-tight leading-snug mt-0.5 truncate">
                  {officerName}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-[#145334] shadow-md font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#145334]' : 'text-emerald-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#145334]' : 'opacity-40'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Sign Out */}
        <div className="pt-4 border-t border-emerald-600/30">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-red-600/80 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
}
