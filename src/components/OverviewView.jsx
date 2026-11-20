import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  TRAP_CODES_BY_DISTRICT,
  DISTRICTS_BY_STATE,
  getTrapWeeklyData,
  getDistrictHourlyData,
} from '../data/trapDetailData';
import { TRAPS_DATA } from '../data/mockData';

export default function OverviewView({ currentUserRole, onSelectDistrict }) {
  // Available states based on role
  const availableStates = useMemo(() => {
    if (currentUserRole?.state) return [currentUserRole.state];
    return ['Haryana', 'Punjab', 'Rajasthan'];
  }, [currentUserRole]);

  // Active state selection
  const [selectedState, setSelectedState] = useState(
    currentUserRole?.state || 'Haryana'
  );

  // Synchronize state when role changes
  useEffect(() => {
    if (currentUserRole?.state) {
      setSelectedState(currentUserRole.state);
    }
  }, [currentUserRole]);

  // Available districts based on state & role
  const availableDistricts = useMemo(() => {
    const stateDistricts = DISTRICTS_BY_STATE[selectedState] || [];
    if (currentUserRole?.district) {
      return stateDistricts.filter((d) => d === currentUserRole.district);
    }
    return stateDistricts;
  }, [selectedState, currentUserRole]);

  // Active district selection
  const [selectedDistrict, setSelectedDistrict] = useState(
    currentUserRole?.district || 'Hisar'
  );
  const [liveTraps, setLiveTraps] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/traps');
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.traps) && isMounted) {
          setLiveTraps(data.traps);
        }
      } catch (e) {}
    };
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (currentUserRole?.district) {
      setSelectedDistrict(currentUserRole.district);
    } else if (availableDistricts.length > 0) {
      setSelectedDistrict(availableDistricts[0]);
    }
  }, [selectedState, currentUserRole, availableDistricts]);

  // Dropdown Open States and Click Outside Refs
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const stateRef = useRef(null);
  const districtRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setIsStateOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(e.target)) {
        setIsDistrictOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectState = (st) => {
    setSelectedState(st);
    setIsStateOpen(false);
    const newDistricts = DISTRICTS_BY_STATE[st] || [];
    if (newDistricts.length > 0 && !newDistricts.includes(selectedDistrict)) {
      setSelectedDistrict(newDistricts[0]);
    }
  };

  const handleSelectDistrict = (d) => {
    setSelectedDistrict(d);
    setIsDistrictOpen(false);
  };

  // Traps for currently selected district
  const districtTraps = useMemo(() => {
    return TRAP_CODES_BY_DISTRICT[selectedDistrict] || [];
  }, [selectedDistrict]);

  // Active Trap Code for Weekly view (Matching bottom-left chart dropdown)
  const [selectedTrapCode, setSelectedTrapCode] = useState(
    districtTraps[0]?.code || 'Hisar BHR'
  );

  useEffect(() => {
    if (districtTraps.length > 0) {
      const exists = districtTraps.some((t) => t.code === selectedTrapCode);
      if (!exists) {
        setSelectedTrapCode(districtTraps[0].code);
      }
    }
  }, [districtTraps]);

  // 1. TOP-LEFT: PBW Daily Count Data
  const dailyData = useMemo(() => {
    const data = districtTraps.map((t) => ({
      label: t.code,
      count: t.daily,
    }));
    const maxVal = 100;
    const yAxisSteps = [100, 80, 60, 40, 20, 0];
    return { data, maxVal, yAxisSteps };
  }, [districtTraps]);

  // 2. TOP-RIGHT: PBW Hourly Count Data (24-hour diurnal cycle)
  const hourlyData = useMemo(() => {
    const raw = getDistrictHourlyData(selectedDistrict);
    const maxVal = Math.max(...raw.map((d) => d.count), 20);
    const ceilMax = Math.ceil(maxVal / 5) * 5;
    const step = ceilMax / 5;
    const yAxisSteps = [
      ceilMax,
      Math.round(step * 4),
      Math.round(step * 3),
      Math.round(step * 2),
      Math.round(step * 1),
      0,
    ];
    return { data: raw, maxVal: ceilMax, yAxisSteps };
  }, [selectedDistrict]);

  // 3. BOTTOM-LEFT: PBW Weekly Count Data
  const weeklyData = useMemo(() => {
    const data = getTrapWeeklyData(selectedTrapCode);
    const maxVal = 140;
    const yAxisSteps = [140, 120, 100, 80, 60, 40, 20, 0];
    return { data, maxVal, yAxisSteps };
  }, [selectedTrapCode]);

  // 4. BOTTOM-RIGHT: ETL Report Data
  const etlReportData = useMemo(() => {
    return districtTraps.map((trap) => {
      const isReached = trap.daily >= 8;
      const fullTrap = TRAPS_DATA.find((t) => t.id === trap.code);
      return {
        code: trap.code,
        village: trap.village || fullTrap?.name || 'Field Station',
        district: selectedDistrict,
        state: selectedState,
        dailyCount: trap.daily,
        etlStatus: isReached ? 'ETL reached' : 'Below ETL',
        isReached,
        lastSync: fullTrap?.lastSync || '10-11-2026 08:40:17',
      };
    });
  }, [districtTraps, selectedDistrict, selectedState]);

  return (
    <div className="space-y-5 select-none">
      {/* Real-Time Connected Field Traps Banner */}
      {liveTraps.length > 0 && (
        <div className="bg-[#145334] text-white rounded-2xl p-4 shadow-md border-2 border-emerald-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Live IoT Trap Connected
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600">
                  Direct Cloud Feed
                </span>
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {liveTraps[0].id}{' '}
                <span className="text-xs font-normal text-emerald-200">
                  (S/N: {liveTraps[0].device_sn || liveTraps[0].id})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/80">
              <span className="text-[10px] text-emerald-300 block font-semibold">Temperature</span>
              <span className="text-sm font-black text-white">{liveTraps[0].temp} °C</span>
            </div>
            <div className="bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/80">
              <span className="text-[10px] text-emerald-300 block font-semibold">Humidity</span>
              <span className="text-sm font-black text-white">{liveTraps[0].humidity} %</span>
            </div>
            <div className="bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/80">
              <span className="text-[10px] text-emerald-300 block font-semibold">Pressure</span>
              <span className="text-sm font-black text-white">{liveTraps[0].pressure} hPa</span>
            </div>
            <div className="bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/80">
              <span className="text-[10px] text-emerald-300 block font-semibold">Battery</span>
              <span className="text-sm font-black text-white">{liveTraps[0].battery} %</span>
            </div>
            <div className="bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/80">
              <span className="text-[10px] text-emerald-300 block font-semibold">Last Cloud Sync</span>
              <span className="text-xs font-bold text-white">{liveTraps[0].last_sync}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Filter Bar: Exact Match to User Reference Screenshot */}
      <div className="bg-white rounded-2xl p-3 border-2 border-[#dbe3d8] shadow-xs flex items-center gap-3">
        <div className="flex items-center gap-3 text-xs font-semibold">
          {/* State Dropdown Pill */}
          <div className="relative" ref={stateRef}>
            <button
              type="button"
              disabled={!!currentUserRole?.state}
              onClick={() => {
                setIsStateOpen(!isStateOpen);
                setIsDistrictOpen(false);
              }}
              className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-full border-2 border-[#145334] bg-white text-xs font-bold text-[#145334] cursor-pointer shadow-xs hover:bg-[#f6f9f6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>State: {selectedState}</span>
              <span className="text-[10px] text-[#145334] font-bold">▼</span>
            </button>

            {/* State Menu - Lists State Names Alone */}
            {isStateOpen && (
              <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-xl border border-[#cbd5c7] shadow-xl py-1 min-w-[150px] animate-fadeIn">
                {availableStates.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectState(st)}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedState === st
                        ? 'text-[#145334] font-extrabold bg-[#eaf5ed]'
                        : 'text-[#1f2937] font-semibold hover:bg-[#f3f9f4]'
                    }`}
                  >
                    <span>{st}</span>
                    {selectedState === st && (
                      <span className="text-[#145334] text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* District Dropdown Pill */}
          <div className="relative" ref={districtRef}>
            <button
              type="button"
              disabled={!!currentUserRole?.district}
              onClick={() => {
                setIsDistrictOpen(!isDistrictOpen);
                setIsStateOpen(false);
              }}
              className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-full border border-[#cbd5c7] bg-white text-xs font-bold text-[#111827] cursor-pointer shadow-xs hover:bg-[#f8faf7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>District: {selectedDistrict}</span>
              <span className="text-[10px] text-gray-500 font-bold">▼</span>
            </button>

            {/* District Menu - Lists District Names Alone */}
            {isDistrictOpen && (
              <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-xl border border-[#cbd5c7] shadow-xl py-1 min-w-[160px] animate-fadeIn max-h-60 overflow-y-auto">
                {availableDistricts.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleSelectDistrict(d)}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedDistrict === d
                        ? 'text-[#145334] font-extrabold bg-[#eaf5ed]'
                        : 'text-[#1f2937] font-semibold hover:bg-[#f3f9f4]'
                    }`}
                  >
                    <span>{d}</span>
                    {selectedDistrict === d && (
                      <span className="text-[#145334] text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2x2 BALANCED GRID: EXPANSIVE ON 1920x1080 WITH HORIZONTAL NON-SLANTING AXIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ============================================================== */}
        {/* 1. TOP-LEFT: PBW Daily Count                                   */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border-2 border-[#dbe3d8] shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Header Bar: Solid Dark Green */}
          <div className="bg-[#145334] px-5 py-3 text-white">
            <h3 className="text-sm font-extrabold tracking-tight">
              PBW Daily Count
            </h3>
          </div>

          {/* Chart Canvas */}
          <div className="p-5 pt-6">
            <div className="relative h-[320px] 2xl:h-[350px] flex items-stretch">
              {/* Y-axis Label */}
              <div className="w-6 flex items-center justify-center -ml-2">
                <span className="text-[10px] text-[#55645a] font-bold -rotate-90 whitespace-nowrap">
                  PBW Count
                </span>
              </div>

              {/* Y-axis Ticks & Horizontal Gridlines */}
              <div className="absolute left-6 right-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
                {dailyData.yAxisSteps.map((stepVal) => (
                  <div key={stepVal} className="flex items-center gap-2 w-full">
                    <span className="text-[10px] text-[#78887e] font-semibold w-5 text-right tnum">
                      {stepVal}
                    </span>
                    <div className="flex-1 border-b border-[#edf1ea]" />
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="flex-1 ml-7 mr-2 flex items-end justify-around gap-3 pb-10 pt-2 relative z-10">
                {dailyData.data.map((item, idx) => {
                  const heightPct = Math.min(
                    100,
                    Math.round((item.count / dailyData.maxVal) * 100)
                  );

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#145334] text-white px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap pointer-events-none shadow-md z-30">
                        {item.count} moths
                      </div>

                      {/* Solid Green Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[42px] bg-[#1f7a42] hover:bg-[#165a39] rounded-t-xs transition-all duration-300 min-h-[1px]"
                      />

                      {/* Straight Horizontal X-axis Label - No Slanting */}
                      <div className="absolute top-full mt-2.5 text-center text-xs font-bold text-[#111827] pointer-events-none whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-2" />
        </div>

        {/* ============================================================== */}
        {/* 2. TOP-RIGHT: PBW Hourly Count                                 */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border-2 border-[#dbe3d8] shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Header Bar */}
          <div className="bg-[#145334] px-5 py-3 text-white">
            <h3 className="text-sm font-extrabold tracking-tight">
              Hourly PBW Count
            </h3>
          </div>

          {/* Chart Canvas */}
          <div className="p-5 pt-6">
            <div className="relative h-[320px] 2xl:h-[350px] flex items-stretch">
              {/* Y-axis Label */}
              <div className="w-6 flex items-center justify-center -ml-2">
                <span className="text-[10px] text-[#55645a] font-bold -rotate-90 whitespace-nowrap">
                  PBW Count
                </span>
              </div>

              {/* Y-axis Ticks & Horizontal Gridlines */}
              <div className="absolute left-6 right-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
                {hourlyData.yAxisSteps.map((stepVal) => (
                  <div key={stepVal} className="flex items-center gap-2 w-full">
                    <span className="text-[10px] text-[#78887e] font-semibold w-5 text-right tnum">
                      {stepVal}
                    </span>
                    <div className="flex-1 border-b border-[#edf1ea]" />
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="flex-1 ml-7 mr-2 flex items-end justify-around gap-2 pb-10 pt-2 relative z-10">
                {hourlyData.data.map((item, idx) => {
                  const heightPct = Math.min(
                    100,
                    Math.round((item.count / hourlyData.maxVal) * 100)
                  );

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#145334] text-white px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap pointer-events-none shadow-md z-30">
                        {item.count} moths ({item.hour} - {item.label})
                      </div>

                      {/* Solid Green Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[32px] bg-[#1f7a42] hover:bg-[#165a39] rounded-t-xs transition-all duration-300 min-h-[1px]"
                      />

                      {/* Straight Horizontal X-axis Label - No Slanting */}
                      <div className="absolute top-full mt-2.5 text-center text-[11px] font-semibold text-[#374151] pointer-events-none whitespace-nowrap">
                        {item.hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-2" />
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM-LEFT: PBW Weekly Count                               */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border-2 border-[#dbe3d8] shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Header Bar with Trap Selector on Right */}
          <div className="bg-[#145334] px-5 py-2.5 text-white flex items-center justify-between">
            <h3 className="text-sm font-extrabold tracking-tight">
              PBW Weekly Count
            </h3>

            {/* Trap Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedTrapCode}
                onChange={(e) => setSelectedTrapCode(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1 rounded-lg bg-white text-[#111827] font-bold text-xs focus:outline-none cursor-pointer shadow-xs border border-white/20"
              >
                {districtTraps.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code}
                  </option>
                ))}
              </select>
              <span className="text-gray-600 text-[10px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                ▼
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="p-5 pt-6">
            <div className="relative h-[320px] 2xl:h-[350px] flex items-stretch">
              {/* Y-axis Label */}
              <div className="w-6 flex items-center justify-center -ml-2">
                <span className="text-[10px] text-[#55645a] font-bold -rotate-90 whitespace-nowrap">
                  PBW Count
                </span>
              </div>

              {/* Y-axis Ticks & Horizontal Gridlines */}
              <div className="absolute left-6 right-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
                {weeklyData.yAxisSteps.map((stepVal) => (
                  <div key={stepVal} className="flex items-center gap-2 w-full">
                    <span className="text-[10px] text-[#78887e] font-semibold w-5 text-right tnum">
                      {stepVal}
                    </span>
                    <div className="flex-1 border-b border-[#edf1ea]" />
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="flex-1 ml-7 mr-2 flex items-end justify-around gap-2 pb-10 pt-2 relative z-10">
                {weeklyData.data.map((item, idx) => {
                  const heightPct = Math.min(
                    100,
                    Math.round((item.count / weeklyData.maxVal) * 100)
                  );
                  // Extract day number (e.g. "05" from "2026-11-05")
                  const dayNum = item.date.split('-')[2] || item.date;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#145334] text-white px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap pointer-events-none shadow-md z-30">
                        {item.count} moths ({item.date})
                      </div>

                      {/* Solid Green Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[38px] bg-[#1f7a42] hover:bg-[#165a39] rounded-t-xs transition-all duration-300 min-h-[1px]"
                      />

                      {/* Clean Calendar-Style Horizontal Date Tag - No Slanting */}
                      <div className="absolute top-full mt-2 flex flex-col items-center pointer-events-none">
                        <span className="text-xs font-bold text-[#111827] leading-tight">
                          {dayNum}
                        </span>
                        <span className="text-[9.5px] font-semibold text-[#55645a] uppercase leading-none">
                          Nov
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-2" />
        </div>

        {/* ============================================================== */}
        {/* 4. BOTTOM-RIGHT: ETL Report (Fills Card Height, Wrapped Data)  */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border-2 border-[#dbe3d8] shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Header Bar */}
          <div className="bg-[#145334] px-5 py-3 text-white">
            <h3 className="text-sm font-extrabold tracking-tight">
              ETL Report
            </h3>
          </div>

          {/* Table Container - Stretches and fills vertical space without empty gap */}
          <div className="overflow-x-auto flex-1 flex flex-col justify-between min-h-[320px] 2xl:min-h-[350px]">
            <table className="w-full h-full text-left border-collapse">
              <thead>
                <tr className="bg-[#165a39] text-white font-extrabold text-xs uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3.5 px-4">Trap Code</th>
                  <th className="py-3.5 px-3">District</th>
                  <th className="py-3.5 px-3">State</th>
                  <th className="py-3.5 px-3 text-center">Daily Count</th>
                  <th className="py-3.5 px-3 text-center">ETL Status</th>
                  <th className="py-3.5 px-4 text-right">Telemetry Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ea] bg-white h-full">
                {etlReportData.map((row) => (
                  <tr
                    key={row.code}
                    className="hover:bg-[#f6f9f6] transition-colors"
                  >
                    {/* Trap Code with Location Wrapping */}
                    <td className="py-4 2xl:py-5 px-4 align-middle">
                      <div className="font-extrabold text-sm text-[#111827] leading-snug">
                        {row.code}
                      </div>
                      <div className="text-xs font-semibold text-[#55645a] leading-tight mt-0.5">
                        {row.village}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-4 2xl:py-5 px-3 align-middle font-bold text-sm text-[#374151]">
                      {row.district}
                    </td>

                    {/* State */}
                    <td className="py-4 2xl:py-5 px-3 align-middle font-semibold text-sm text-[#4b5563]">
                      {row.state}
                    </td>

                    {/* Daily Count - Prominent & Heavy */}
                    <td className="py-4 2xl:py-5 px-3 align-middle text-center font-black text-base text-[#111827] tnum">
                      {row.dailyCount}
                    </td>

                    {/* ETL Status Badge */}
                    <td className="py-4 2xl:py-5 px-3 align-middle text-center">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-xs font-extrabold ${
                          row.isReached
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-100 text-[#145334] border border-emerald-200'
                        }`}
                      >
                        {row.etlStatus}
                      </span>
                    </td>

                    {/* Telemetry Sync - Wrapped Date & Time */}
                    <td className="py-4 2xl:py-5 px-4 align-middle text-right font-semibold text-xs text-[#4b5563]">
                      <div className="leading-snug">{row.lastSync.split(' ')[0]}</div>
                      <div className="text-[11px] text-[#78887e] font-medium leading-tight mt-0.5">
                        {row.lastSync.split(' ')[1]}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
