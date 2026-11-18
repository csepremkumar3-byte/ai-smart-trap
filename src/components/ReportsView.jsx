import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Download, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { REPORTS_METRICS, DAILY_MOTH_TREND, TRAPS_DATA } from '../data/mockData';

export default function ReportsView({ currentUserRole }) {
  const [districtFilter, setDistrictFilter] = useState(
    currentUserRole?.district || 'All Districts'
  );
  const [trapFilter, setTrapFilter] = useState('All Traps');
  const [fromDate, setFromDate] = useState('2026-10-28');
  const [toDate, setToDate] = useState('2026-11-04');
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  // Sync with role changes
  React.useEffect(() => {
    if (currentUserRole?.district) {
      setDistrictFilter(currentUserRole.district);
    } else {
      setDistrictFilter('All Districts');
    }
  }, [currentUserRole]);

  // Generate extended report table records
  const reportData = useMemo(() => {
    return [
      { id: 'PB-FZK-01', district: 'Fazilka', state: 'Punjab', moths: 42, level: 'High', status: 'Active' },
      { id: 'PB-BTI-04', district: 'Bathinda', state: 'Punjab', moths: 18, level: 'Moderate', status: 'Active' },
      { id: 'HR-SRS-02', district: 'Sirsa', state: 'Haryana', moths: 9, level: 'Low', status: 'Active' },
      { id: 'RJ-SGN-03', district: 'Sri Ganganagar', state: 'Rajasthan', moths: 33, level: 'High', status: 'Active' },
      { id: 'PB-MKT-01', district: 'Muktsar', state: 'Punjab', moths: 39, level: 'High', status: 'Active' },
      { id: 'HR-HSR-01', district: 'Hisar', state: 'Haryana', moths: 45, level: 'High', status: 'Active' },
      { id: 'RJ-HMG-01', district: 'Hanumangarh', state: 'Rajasthan', moths: 28, level: 'Moderate', status: 'Active' },
      { id: 'PB-FZK-02', district: 'Fazilka', state: 'Punjab', moths: 14, level: 'Low', status: 'Active' },
      { id: 'PB-BTI-01', district: 'Bathinda', state: 'Punjab', moths: 26, level: 'Moderate', status: 'Active' },
      { id: 'HR-SRS-01', district: 'Sirsa', state: 'Haryana', moths: 8, level: 'Low', status: 'Active' },
      { id: 'RJ-SGN-01', district: 'Sri Ganganagar', state: 'Rajasthan', moths: 0, level: 'Offline', status: 'Offline' },
    ].filter((item) => {
      // Role scope lock
      if (currentUserRole?.state && item.state !== currentUserRole.state) return false;
      if (currentUserRole?.district && item.district !== currentUserRole.district) return false;

      if (districtFilter !== 'All Districts' && item.district !== districtFilter) return false;
      if (trapFilter !== 'All Traps' && item.id !== trapFilter) return false;
      return true;
    });
  }, [districtFilter, trapFilter, currentUserRole]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Trap ID',
        cell: (info) => <span className="font-bold text-[#1c2826]">{info.getValue()}</span>,
      },
      {
        accessorKey: 'district',
        header: 'District',
        cell: (info) => <span className="text-[#3c4a40] font-medium">{info.getValue()}</span>,
      },
      {
        accessorKey: 'state',
        header: 'State',
        cell: (info) => <span className="text-[#78887e]">{info.getValue()}</span>,
      },
      {
        accessorKey: 'moths',
        header: 'Moths',
        cell: (info) => <span className="font-bold text-[#1c2826]">{info.getValue()}</span>,
      },
      {
        accessorKey: 'level',
        header: 'Level',
        cell: (info) => {
          const val = info.getValue();
          const colors = {
            Low: 'bg-[#eaf5ed] text-[#166534]',
            Moderate: 'bg-[#fef6e7] text-[#b45309]',
            High: 'bg-[#fdeeed] text-[#b91c1c]',
            Offline: 'bg-gray-100 text-gray-600',
          }[val] || 'bg-gray-100 text-gray-700';
          return (
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${colors}`}>
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue();
          const isActive = val === 'Active';
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isActive ? 'bg-[#eaf5ed] text-[#166534]' : 'bg-red-50 text-red-600'
              }`}
            >
              {val}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: reportData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  const handleExportCSV = () => {
    const headers = ['Trap ID', 'District', 'State', 'Moths', 'Level', 'Status'];
    const rows = reportData.map((d) => [d.id, d.district, d.state, d.moths, d.level, d.status]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CICR_Moth_Report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Report exported as CSV successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const maxDailyTrend = Math.max(...DAILY_MOTH_TREND.map((d) => d.count));

  const stats = [
    {
      title: 'Total Moths',
      value: REPORTS_METRICS.totalMoths,
      subtext: REPORTS_METRICS.totalMothsSub,
      color: 'bg-[#165a39]',
    },
    {
      title: 'Peak Day',
      value: REPORTS_METRICS.peakDay,
      subtext: REPORTS_METRICS.peakDaySub,
      color: 'bg-[#d97706]',
    },
    {
      title: 'High-risk Traps',
      value: REPORTS_METRICS.highRiskTraps,
      subtext: REPORTS_METRICS.highRiskSub,
      color: 'bg-[#dc2626]',
    },
    {
      title: 'Avg per Trap',
      value: REPORTS_METRICS.avgPerTrap,
      subtext: REPORTS_METRICS.avgPerTrapSub,
      color: 'bg-[#2563eb]',
    },
    {
      title: 'Reports',
      value: REPORTS_METRICS.reportsCount,
      subtext: REPORTS_METRICS.reportsSub,
      color: 'bg-[#64748b]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters / Action Row */}
      <div className="bg-white rounded-2xl p-3 border border-[#e4e8e0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center gap-3">
        {/* District */}
        <div className="flex flex-col min-w-[140px] flex-1">
          <label className="text-[10px] font-bold text-[#78887e] uppercase mb-1">District</label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#e4e8e0] bg-[#fbfcfb] text-[#1c2826] font-medium focus:outline-none focus:ring-1 focus:ring-[#165a39]"
          >
            <option value="All Districts">All Districts</option>
            <option value="Fazilka">Fazilka</option>
            <option value="Bathinda">Bathinda</option>
            <option value="Muktsar">Muktsar</option>
            <option value="Sirsa">Sirsa</option>
            <option value="Hisar">Hisar</option>
            <option value="Sri Ganganagar">Sri Ganganagar</option>
            <option value="Hanumangarh">Hanumangarh</option>
          </select>
        </div>

        {/* Trap */}
        <div className="flex flex-col min-w-[140px] flex-1">
          <label className="text-[10px] font-bold text-[#78887e] uppercase mb-1">Trap</label>
          <select
            value={trapFilter}
            onChange={(e) => setTrapFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#e4e8e0] bg-[#fbfcfb] text-[#1c2826] font-medium focus:outline-none focus:ring-1 focus:ring-[#165a39]"
          >
            <option value="All Traps">All Traps</option>
            {TRAPS_DATA.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} ({t.district})
              </option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div className="flex flex-col min-w-[130px] flex-1">
          <label className="text-[10px] font-bold text-[#78887e] uppercase mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#e4e8e0] bg-[#fbfcfb] text-[#1c2826] font-medium focus:outline-none focus:ring-1 focus:ring-[#165a39]"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col min-w-[130px] flex-1">
          <label className="text-[10px] font-bold text-[#78887e] uppercase mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#e4e8e0] bg-[#fbfcfb] text-[#1c2826] font-medium focus:outline-none focus:ring-1 focus:ring-[#165a39]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => {
              setExportNotice('Data query refreshed for selected parameters.');
              setTimeout(() => setExportNotice(null), 2500);
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#145334] text-white hover:bg-[#10432a] transition-colors shadow-sm"
          >
            Generate
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#d6ddd3] bg-white text-[#1c2826] hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#145334]" />
            Export
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-[#eaf5ed] border border-emerald-300 text-[#166534] px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#166534]" />
          {exportNotice}
        </div>
      )}

      {/* 5 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-[#e4e8e0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1 h-3.5 rounded-full ${stat.color}`} />
              <span className="text-xs font-semibold text-[#5f6e63]">{stat.title}</span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-[#1c2826]">{stat.value}</div>
            <div className="text-[12px] text-[#78887e] mt-1 font-medium">{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* Daily Moth Catch Trend Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#e4e8e0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#1c2826]">Daily Moth Catch Trend</h3>
          <p className="text-xs text-[#78887e] mt-0.5">Timeline across all monitored delta traps</p>
        </div>

        <div className="h-60 flex items-end justify-between gap-3 pt-4 px-2 border-b border-[#eef1eb] relative">
          {/* Background guide lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-[#eef1eb] w-full" />
            <div className="border-b border-[#eef1eb] w-full" />
            <div className="border-b border-[#eef1eb] w-full" />
          </div>

          {DAILY_MOTH_TREND.map((item) => {
            const heightPct = Math.round((item.count / (maxDailyTrend * 1.15)) * 100);
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group z-10">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 bg-[#145334] text-white text-[11px] rounded-md font-medium pointer-events-none whitespace-nowrap shadow-sm">
                  {item.count} moths
                </div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[42px] bg-[#1d7044] hover:bg-[#165a39] rounded-t-md transition-all duration-300"
                />
                <div className="text-xs text-[#78887e] font-medium mt-3 whitespace-nowrap">{item.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TanStack Table: Trap-wise Report */}
      <div className="bg-white rounded-2xl p-6 border border-[#e4e8e0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1c2826]">Trap-wise Report</h3>
            <p className="text-xs text-[#78887e] mt-0.5">Click column headers to sort, or filter records</p>
          </div>

          <input
            type="text"
            placeholder="Filter table rows..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-[#e4e8e0] bg-[#fbfcfb] text-[#1c2826] placeholder-[#8a9990] focus:outline-none focus:ring-1 focus:ring-[#165a39]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[#eef1eb] text-[11px] font-semibold text-[#78887e] uppercase tracking-wider">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="pb-3 px-3 cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#f4f6f1] text-xs font-medium text-[#1c2826]">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#f9faf7] transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3.5 px-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TanStack Table Pagination */}
        <div className="mt-4 pt-3 border-t border-[#eef1eb] flex items-center justify-between text-xs text-[#78887e]">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              reportData.length
            )}{' '}
            of {reportData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[#e4e8e0] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-[#1c2826]" />
            </button>
            <span className="font-semibold text-[#1c2826]">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[#e4e8e0] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-[#1c2826]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
