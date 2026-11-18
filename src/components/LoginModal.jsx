import React, { useState } from 'react';
import { USER_ROLES } from '../data/authRoles';
import { Shield, MapPin, Check, Building2, UserCheck, X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, currentRole, onSelectRole }) {
  if (!isOpen) return null;

  const overallRoles = USER_ROLES.filter((r) => r.tier === 'overall');
  const stateRoles = USER_ROLES.filter((r) => r.tier === 'state');
  const districtRoles = USER_ROLES.filter((r) => r.tier === 'district');

  const handleChoose = (role) => {
    onSelectRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e4e8e0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#145334] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Role-Based Portal Access</h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Select your designated login tier (No registration required)
              </p>
            </div>
          </div>
          {currentRole && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Roles List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tier 1: Overall Admin */}
          <div>
            <div className="text-[11px] font-bold text-[#145334] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Tier 1: Overall Login (1 Role)
            </div>
            <div className="space-y-2">
              {overallRoles.map((r) => {
                const isCurrent = currentRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleChoose(r)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-[#145334] bg-[#eaf5ed] ring-1 ring-[#145334]'
                        : 'border-[#e4e8e0] bg-[#fbfcfb] hover:border-[#145334]/40 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1c2826]">{r.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#145334] text-white">
                          Full Visibility
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5f6e63] mt-0.5">{r.scopeLabel}</p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-[#145334]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 2: State-wise Login */}
          <div>
            <div className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Tier 2: State-wise Login (3 Roles)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {stateRoles.map((r) => {
                const isCurrent = currentRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleChoose(r)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-[#e4e8e0] bg-[#fbfcfb] hover:border-blue-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1c2826]">{r.state}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-[#5f6e63] mt-1">{r.name}</p>
                    <span className="text-[9px] font-semibold text-blue-700 mt-2 bg-blue-100/70 px-1.5 py-0.5 rounded self-start">
                      State Scoped
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 3: District-wise Login */}
          <div>
            <div className="text-[11px] font-bold text-[#d97706] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Tier 3: District-wise Login (8 Roles)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {districtRoles.map((r) => {
                const isCurrent = currentRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleChoose(r)}
                    className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600'
                        : 'border-[#e4e8e0] bg-[#fbfcfb] hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#1c2826] truncate">{r.district}</span>
                        {isCurrent && <Check className="w-3 h-3 text-amber-600" />}
                      </div>
                      <span className="text-[9px] text-[#78887e]">{r.state}</span>
                    </div>
                    <span className="text-[9px] font-medium text-amber-800 mt-2 bg-amber-100/60 px-1 py-0.5 rounded self-start truncate max-w-full">
                      District Traps
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#f8faf7] border-t border-[#eef1eb] flex items-center justify-between text-xs text-[#5f6e63]">
          <span>Data visibility strictly filtered per active role tier</span>
          {currentRole && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-[#d6ddd3] bg-white text-[#1c2826] hover:bg-gray-50"
            >
              Continue as {currentRole.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
