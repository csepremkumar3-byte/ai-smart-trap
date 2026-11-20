import React, { useState, useMemo } from 'react';
import { TRAPS_DATA } from '../data/mockData';
import TrapModal from './TrapModal';

export default function TrapView({ initialDistrictFilter = 'All', currentUserRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState(
    currentUserRole?.state || 'All'
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    currentUserRole?.district || initialDistrictFilter
  );
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState('All');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [activeModalTrap, setActiveModalTrap] = useState(null);
  const [trapsList, setTrapsList] = useState(TRAPS_DATA);

  // Poll /api/traps every 8 seconds for live trap uploads from ESP32 / demo traps
  React.useEffect(() => {
    let isMounted = true;
    const fetchLiveTraps = async () => {
      try {
        const res = await fetch('/api/traps');
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.traps) && data.traps.length > 0 && isMounted) {
          setTrapsList((prev) => {
            const liveMap = new Map();
            data.traps.forEach((lt) => {
              liveMap.set(lt.id, lt);
              if (lt.device_sn) liveMap.set(lt.device_sn, lt);
            });

            // Update existing traps
            const updated = prev.map((t) => {
              const live = liveMap.get(t.id) || liveMap.get(t.deviceSn);
              if (live) {
                return {
                  ...t,
                  temp: live.temp !== null && live.temp !== undefined ? String(live.temp) : t.temp,
                  humidity: live.humidity !== null && live.humidity !== undefined ? String(live.humidity) : t.humidity,
                  pressure: live.pressure !== null && live.pressure !== undefined ? `${live.pressure} hPa` : t.pressure,
                  battery: live.battery !== null && live.battery !== undefined ? live.battery : t.battery,
                  lastSync: live.last_sync || t.lastSync,
                  issue: live.issue || t.issue,
                  moths: live.moths !== undefined && live.moths !== null ? live.moths : t.moths,
                  imageUrl: live.image_url || t.imageUrl,
                  status: live.status || 'Active',
                };
              }
              return t;
            });

            // Prepend brand new demo/field traps that aren't in mock data
            data.traps.forEach((lt) => {
              const exists = updated.some((t) => t.id === lt.id || t.deviceSn === lt.device_sn);
              if (!exists) {
                updated.unshift({
                  id: lt.id,
                  fullName: lt.full_name || `Live Field Trap - ${lt.id}`,
                  district: lt.district || 'Hisar',
                  state: lt.state || 'Haryana',
                  moths: lt.moths || 0,
                  risk: (lt.moths || 0) >= 8 ? 'High' : 'Low',
                  status: lt.status || 'Active',
                  issue: lt.issue || 'None',
                  temp: String(lt.temp !== null && lt.temp !== undefined ? lt.temp : '24.5'),
                  humidity: String(lt.humidity !== null && lt.humidity !== undefined ? lt.humidity : '65.0'),
                  pressure: `${lt.pressure || 1013} hPa`,
                  altitude: '215 m',
                  deviceSn: lt.device_sn || lt.id,
                  lastSync: lt.last_sync || 'Just now',
                  coords: '29.1492° N, 75.7217° E',
                  firmware: 'ESP32-Live',
                  imageUrl: lt.image_url,
                  battery: lt.battery || 95,
                  detections: []
                });
              }
            });

            return updated;
          });
        }
      } catch (err) {
        // Silently keep current data on network error
      }
    };

    fetchLiveTraps();
    const interval = setInterval(fetchLiveTraps, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync with role changes
  React.useEffect(() => {
    if (currentUserRole?.state) {
      setSelectedState(currentUserRole.state);
    }
    if (currentUserRole?.district) {
      setSelectedDistrict(currentUserRole.district);
    }
  }, [currentUserRole]);

  // Filtered traps
  const filteredTraps = useMemo(() => {
    return trapsList.filter((trap) => {
      // Role scope lock
      if (currentUserRole?.state && trap.state !== currentUserRole.state) return false;
      if (currentUserRole?.district && trap.district !== currentUserRole.district) return false;

      // Search across ID (trap code), Full Name, District, State, Device S/N
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        trap.id.toLowerCase().includes(searchLower) ||
        (trap.fullName && trap.fullName.toLowerCase().includes(searchLower)) ||
        trap.district.toLowerCase().includes(searchLower) ||
        trap.state.toLowerCase().includes(searchLower) ||
        (trap.deviceSn && trap.deviceSn.toLowerCase().includes(searchLower));

      // State
      const matchesState = selectedState === 'All' || trap.state === selectedState;

      // District
      const matchesDistrict = selectedDistrict === 'All' || trap.district === selectedDistrict;

      // Status
      const matchesStatus = selectedStatus === 'All' || trap.status === selectedStatus;

      // Issue filter (matching user exact issue list)
      const matchesIssue =
        selectedIssue === 'All' ||
        (trap.issue && trap.issue.toLowerCase() === selectedIssue.toLowerCase());

      return matchesSearch && matchesState && matchesDistrict && matchesStatus && matchesIssue;
    });
  }, [searchTerm, selectedState, selectedDistrict, selectedStatus, selectedIssue, currentUserRole]);

  // Fleet summary distribution metrics
  const fleetStats = useMemo(() => {
    const total = filteredTraps.length;
    const active = filteredTraps.filter(
      (t) => t.status === 'Active' && (!t.issue || t.issue === 'None')
    ).length;
    const faults = filteredTraps.filter(
      (t) => t.issue && t.issue !== 'None'
    ).length;
    const totalMoths = filteredTraps.reduce(
      (sum, t) => sum + (typeof t.moths === 'number' ? t.moths : 0),
      0
    );
    return { total, active, faults, totalMoths };
  }, [filteredTraps]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedState(currentUserRole?.state || 'All');
    setSelectedDistrict(currentUserRole?.district || 'All');
    setSelectedStatus('All');
    setSelectedIssue('All');
    setSelectedDate('Today');
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar with Clean Native-Style Controls (No SVG Icons) */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#dbe3d8] shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search trap code (e.g. Hisar BHR, Fazilka ABH), district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#cbd5c7] bg-[#fbfcfb] text-[#111827] font-medium placeholder-[#78887e] focus:outline-none focus:ring-2 focus:ring-[#165a39] focus:border-[#165a39]"
          />
        </div>

        {/* State Filter */}
        <div className="relative">
          <select
            value={selectedState}
            disabled={!!currentUserRole?.state}
            onChange={(e) => setSelectedState(e.target.value)}
            className="appearance-none text-xs pl-3 pr-7 py-2 rounded-xl border border-[#cbd5c7] bg-[#fbfcfb] text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#165a39] cursor-pointer disabled:bg-gray-100 disabled:text-gray-600"
          >
            <option value="All">State: All</option>
            <option value="Haryana">Haryana</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
          <span className="text-[#78887e] text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ▼
          </span>
        </div>

        {/* District Filter (7 Active Districts) */}
        <div className="relative">
          <select
            value={selectedDistrict}
            disabled={!!currentUserRole?.district}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="appearance-none text-xs pl-3 pr-7 py-2 rounded-xl border border-[#cbd5c7] bg-[#fbfcfb] text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#165a39] cursor-pointer disabled:bg-gray-100 disabled:text-gray-600"
          >
            <option value="All">District: All</option>
            <option value="Hisar">Hisar</option>
            <option value="Sirsa">Sirsa</option>
            <option value="Fazilka">Fazilka</option>
            <option value="Bathinda">Bathinda</option>
            <option value="Muktsar">Muktsar</option>
            <option value="Sri Ganganagar">Sri Ganganagar</option>
            <option value="Hanumangarh">Hanumangarh</option>
          </select>
          <span className="text-[#78887e] text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ▼
          </span>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none text-xs pl-3 pr-7 py-2 rounded-xl border border-[#cbd5c7] bg-[#fbfcfb] text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#165a39] cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Offline">Offline</option>
          </select>
          <span className="text-[#78887e] text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ▼
          </span>
        </div>

        {/* Issue Filter (Consists of the 5 requested hardware issues) */}
        <div className="relative">
          <select
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="appearance-none text-xs pl-3 pr-7 py-2 rounded-xl border border-[#cbd5c7] bg-[#fbfcfb] text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#165a39] cursor-pointer"
          >
            <option value="All">Issue: All</option>
            <option value="Internal board fault">Internal board fault</option>
            <option value="Weather sensor fault">Weather sensor fault</option>
            <option value="Power supply fault">Power supply fault</option>
            <option value="4G dongle fault">4G dongle fault</option>
            <option value="Trap offline">Trap offline</option>
          </select>
          <span className="text-[#78887e] text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ▼
          </span>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="appearance-none text-xs pl-3 pr-7 py-2 rounded-xl border border-[#cbd5c7] bg-[#fbfcfb] text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#165a39] cursor-pointer"
          >
            <option value="Today">Date: Today</option>
            <option value="Yesterday">Date: Yesterday</option>
            <option value="Last 7 Days">Date: Last 7 Days</option>
          </select>
          <span className="text-[#78887e] text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ▼
          </span>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="text-xs px-4 py-2 rounded-xl border border-[#165a39] text-[#165a39] hover:bg-[#165a39] hover:text-white font-bold transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Fleet Overview Distribution Strip (No SVG Icons) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border-2 border-[#dbe3d8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#55645a] uppercase tracking-wider">Filtered Fleet</div>
            <div className="text-2xl font-black text-[#111827] mt-1">
              {fleetStats.total} <span className="text-xs font-semibold text-[#78887e]">Traps</span>
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-[#145334]" />
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-[#dbe3d8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#55645a] uppercase tracking-wider">Operational</div>
            <div className="text-2xl font-black text-[#145334] mt-1">
              {fleetStats.active} <span className="text-xs font-semibold text-emerald-700">Active</span>
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-[#dbe3d8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#55645a] uppercase tracking-wider">Hardware Alerts</div>
            <div className="text-2xl font-black text-amber-800 mt-1">
              {fleetStats.faults} <span className="text-xs font-semibold text-amber-700">Faults</span>
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-[#dbe3d8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#55645a] uppercase tracking-wider">Moths Caught</div>
            <div className="text-2xl font-black text-[#145334] mt-1">
              {fleetStats.totalMoths.toLocaleString()} <span className="text-xs font-semibold text-[#55645a]">PBW</span>
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-[#165a39]" />
        </div>
      </div>

      {/* Unified Fleet Surveillance Grid (All Cards Visible Together) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
        {filteredTraps.map((trap) => {
          const hasFault = trap.issue && trap.issue !== 'None';

          return (
            <div
              key={trap.id}
              onClick={() => setActiveModalTrap(trap)}
              className="bg-white rounded-2xl border-2 border-[#d5ded2] hover:border-[#145334] hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* 1. Header: Prominent Trap Code */}
                <div className="px-4 py-3 bg-[#f8faf7] border-b border-[#e5ebe3] flex items-center justify-between">
                  <div className="text-lg font-black tracking-tight text-[#145334]">
                    {trap.id}
                  </div>

                  {/* Fault badge only if actual hardware issue */}
                  {hasFault && (
                    <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {trap.issue}
                    </span>
                  )}
                </div>

                {/* 2. Hero Catch Callout: Pink Bollworm */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-[#edf2ec] bg-white">
                  <span className="text-xs font-black text-[#145334] uppercase tracking-wider">
                    Pink Bollworm
                  </span>
                  <div className="text-2xl font-black text-[#145334] tracking-tight tnum">
                    {trap.moths !== null ? trap.moths : '—'}
                  </div>
                </div>

                {/* 3. High-Visibility Surveillance Telemetry List */}
                <div className="p-3 bg-white divide-y divide-[#edf1ea] text-xs">
                  <div className="flex items-center justify-between py-1.5 px-1 hover:bg-[#f8faf7] rounded transition-colors">
                    <span className="text-[11.5px] text-[#55645a] font-semibold">Temperature</span>
                    <span className="text-xs font-extrabold text-[#111827]">
                      {trap.temp !== null && trap.temp !== '—' ? `${trap.temp} °C` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-1 hover:bg-[#f8faf7] rounded transition-colors">
                    <span className="text-[11.5px] text-[#55645a] font-semibold">Humidity</span>
                    <span className="text-xs font-extrabold text-[#111827]">
                      {trap.humidity !== null && trap.humidity !== '—' ? `${trap.humidity} %` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-1 hover:bg-[#f8faf7] rounded transition-colors">
                    <span className="text-[11.5px] text-[#55645a] font-semibold">Air Pressure</span>
                    <span className="text-xs font-extrabold text-[#111827]">
                      {trap.pressure || '388 hPa'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-1 hover:bg-[#f8faf7] rounded transition-colors">
                    <span className="text-[11.5px] text-[#55645a] font-semibold">Altitude</span>
                    <span className="text-xs font-extrabold text-[#111827]">
                      {trap.altitude || '612.42 m'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-1 hover:bg-[#f8faf7] rounded transition-colors">
                    <span className="text-[11.5px] text-[#55645a] font-semibold">Device S/N</span>
                    <span className="text-xs font-extrabold text-[#111827]">
                      {trap.deviceSn || 'IMAI036CICRH0022'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-1 hover:bg-[#f8faf7] rounded transition-colors">
                    <span className="text-[11.5px] text-[#55645a] font-semibold">Date &amp; Time</span>
                    <span className="text-[11px] font-bold text-[#111827]">
                      {trap.lastSync || '10-11-2026 08:40:17'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Card Footer Inspection Action (Click to View Camera Inspection & Diagnostics) */}
              <div className="px-4 py-2.5 bg-[#fbfcfb] border-t border-[#edf2ec] text-center text-xs font-extrabold text-[#145334] group-hover:bg-[#f0f6f1] transition-colors">
                View Camera Inspection &amp; Diagnostics →
              </div>
            </div>
          );
        })}
      </div>

      {filteredTraps.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-[#dbe3d8]">
          <div className="text-base font-bold text-[#111827]">No traps match current filters</div>
          <p className="text-xs font-medium text-[#55645a] mt-1">Try adjusting the Issue or District filters</p>
          <button
            onClick={handleReset}
            className="mt-3 text-xs font-bold text-[#145334] underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {activeModalTrap && (
        <TrapModal trap={activeModalTrap} onClose={() => setActiveModalTrap(null)} />
      )}
    </div>
  );
}
