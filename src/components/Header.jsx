import React from 'react';
import { Menu, LogOut } from 'lucide-react';

export default function Header({ currentView, onOpenDrawer, currentUserRole, onLogout }) {
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'overview':
        return 'Overview';
      case 'traps':
        return 'Trap View';
      case 'reports':
        return 'Reports';
      default:
        return 'Overview';
    }
  };

  const officerName =
    currentUserRole?.id === 'central_directorate'
      ? 'Dr. K. Rameash'
      : currentUserRole?.name || 'Administrator';

  const officerDesignation =
    currentUserRole?.id === 'central_directorate'
      ? 'Principal Scientist, ICAR-CICR'
      : (currentUserRole?.designation || '').replace(
          /National Project Directorate/gi,
          'Principal Scientist, ICAR-CICR'
        );

  return (
    <header className="mb-6 flex items-center justify-between gap-4 select-none">
      {/* Left side: Navigation Drawer Trigger & Clean Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenDrawer}
          className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#dbe3d8] text-[#145334] hover:bg-[#eef4ed] hover:border-[#145334] transition-all shadow-xs flex items-center gap-2 group active:scale-95 cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu className="w-4 h-4 text-[#145334] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Navigation</span>
        </button>

        <div className="h-6 w-px bg-[#dbe3d8]" />

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827] leading-none">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Right side: Officer Profile Area with Emblem (No extra user icon) */}
      <div className="flex items-center gap-2.5">
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 bg-white border-2 border-[#dbe3d8] rounded-2xl shadow-xs hover:border-[#145334] transition-all">
          <div className="relative shrink-0">
            <img
              src="/cicr-logo.png"
              alt="CICR Emblem"
              className="w-8 h-8 rounded-full border border-emerald-600/30 object-cover shadow-2xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold text-[#111827] leading-tight">
              {officerName}
            </div>
            <div className="text-[10.5px] text-[#55645a] font-semibold leading-tight mt-0.5">
              {officerDesignation}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border-2 border-[#dbe3d8] text-[#55645a] hover:text-red-700 hover:border-red-300 hover:bg-red-50/60 transition-all font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          title="Log out of portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
