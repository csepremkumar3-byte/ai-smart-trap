import React, { useState, useMemo } from 'react';
import { X, Wifi, Cpu, Hash } from 'lucide-react';
import { getInspectionImageForTrap } from '../data/inspectionImages';

export default function TrapModal({ trap, onClose }) {
  if (!trap) return null;

  const [isVerified, setIsVerified] = useState(false);
  const hasFault = Boolean(trap.issue && trap.issue !== 'None');

  // Exactly ONE dedicated image for this specific card (or live camera upload)
  const inspectionImage = useMemo(() => {
    if (trap.imageUrl) {
      return { src: trap.imageUrl, title: 'Live Field Camera Inspection' };
    }
    return getInspectionImageForTrap(trap.id);
  }, [trap.id, trap.imageUrl]);

  const handleVerify = () => {
    setIsVerified(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#dbe3d8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header: TR, Trap Code with Count underneath, and Issue at right end side */}
        <div className="px-6 py-4 bg-[#f8faf7] border-b border-[#eef1eb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#145334] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              TR
            </div>
            <div>
              <h3 className="text-lg font-black text-[#111827] leading-tight">
                {trap.id}
              </h3>
              <div className="text-xs font-semibold text-[#55645a] mt-0.5">
                Count:{' '}
                <strong className="text-[#145334] font-black tnum">
                  {trap.moths !== null && trap.moths !== undefined ? trap.moths : 0}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Issue badge at right end side */}
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                hasFault
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              Issue: {trap.issue && trap.issue !== 'None' ? trap.issue : 'None'}
            </span>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ============================================================== */}
          {/* Pure Camera Image: No bounding box, No clutters, No black bg    */}
          {/* ============================================================== */}
          <div className="w-full flex items-center justify-center rounded-2xl overflow-hidden border-2 border-[#dbe3d8] bg-white p-2">
            <img
              src={inspectionImage?.src || '/trap-inspection-images/inspection-01.jpeg'}
              alt={trap.id}
              className="w-full max-h-[480px] object-contain rounded-xl"
              onError={(e) => {
                e.target.src = '/trap-inspection-images/inspection-01.jpeg';
              }}
            />
          </div>

          {/* ============================================================== */}
          {/* Environmental Telemetry Grid                                   */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border-2 border-[#dbe3d8]">
              <span className="text-xs font-bold text-[#55645a]">Temperature</span>
              <div className="text-xl font-black text-[#111827] mt-1 tnum">
                {trap.temp !== null && trap.temp !== undefined && trap.temp !== '—'
                  ? `${trap.temp} °C`
                  : '—'}
              </div>
              <span className="text-[10px] text-[#78887e] font-semibold">
                Digital Thermal Sensor
              </span>
            </div>

            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border-2 border-[#dbe3d8]">
              <span className="text-xs font-bold text-[#55645a]">Humidity</span>
              <div className="text-xl font-black text-[#111827] mt-1 tnum">
                {trap.humidity !== null && trap.humidity !== undefined && trap.humidity !== '—'
                  ? `${trap.humidity} %`
                  : '—'}
              </div>
              <span className="text-[10px] text-[#78887e] font-semibold">
                Relative Humidity
              </span>
            </div>

            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border-2 border-[#dbe3d8]">
              <span className="text-xs font-bold text-[#55645a]">
                Air Pressure
              </span>
              <div className="text-xl font-black text-[#111827] mt-1 tnum">
                {trap.pressure || '388 hPa'}
              </div>
              <span className="text-[10px] text-[#78887e] font-semibold">
                Barometric Sensor
              </span>
            </div>

            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border-2 border-[#dbe3d8]">
              <span className="text-xs font-bold text-[#55645a]">Altitude</span>
              <div className="text-xl font-black text-[#111827] mt-1 tnum">
                {trap.altitude || '612.42 m'}
              </div>
              <span className="text-[10px] text-[#78887e] font-semibold">
                GPS Elevation
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Hardware & Diagnostics Details                                 */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-4 border-2 border-[#dbe3d8] space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#55645a]">
              Hardware &amp; Edge Diagnostics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#111827]">
                <Hash className="w-4 h-4 text-[#145334]" />
                <span>
                  Device S/N:{' '}
                  <strong className="font-extrabold">
                    {trap.deviceSn || 'IMAI036CICRH0022'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#111827]">
                <Cpu className="w-4 h-4 text-[#145334]" />
                <span>
                  Firmware:{' '}
                  <strong className="font-bold">
                    {trap.firmware || 'ESP32-v2.4.1'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#111827]">
                <Wifi className="w-4 h-4 text-[#145334]" />
                <span>
                  Telemetry Signal:{' '}
                  <strong className="font-bold">-68 dBm (4G LTE)</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f8faf7] border-t border-[#eef1eb] flex items-center justify-end">
          <button
            onClick={handleVerify}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
              isVerified
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-[#145334] text-white hover:bg-[#114a2f]'
            }`}
          >
            {isVerified ? 'Counts Verified ✓' : 'Verify Counts'}
          </button>
        </div>
      </div>
    </div>
  );
}
