
import React, { useState, useEffect } from 'react';
import { UserProfile, MediaLog } from '../types';
import { firebaseService } from '../services/firebaseService';
import { FileDown, FileText, Calendar, Filter, PieChart, Download, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useRef } from "react";

const ReportsView: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [activeReport, setActiveReport] = useState<null | 'weekly' | 'violations' | 'logs' | 'insights'>(null);
  const totalLogs = logs.length;
  const navigate = useNavigate();
  const location = useLocation();

const totalViolations = logs.reduce((acc, l) =>
  acc + (l.analysis?.compliance_flags?.filter(f => f.category !== 'safe').length || 0)
, 0);

const audioLogs = logs.filter(l => l.type === "AUDIO").length;
const videoLogs = logs.filter(l => l.type === "VIDEO").length;

const violationCount: any = {};

const logsRef = useRef<HTMLDivElement | null>(null);

logs.forEach(l => {
  l.analysis?.compliance_flags
    ?.filter(f => f.category !== 'safe')
    .forEach(f => {
      violationCount[f.category] = (violationCount[f.category] || 0) + 1;
    });
});

const topViolation = Object.keys(violationCount).length
  ? Object.keys(violationCount).reduce((a, b) =>
      violationCount[a] > violationCount[b] ? a : b
    )
  : null;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view");
  
    if (view === "logs") {
      setActiveReport("logs");
    }
  }, [location.search]);

  useEffect(() => {
    const loadData = async () => {
      const data = await firebaseService.getLogs(undefined, user.role);
      setLogs(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeReport === "logs") {
      setTimeout(() => {
        if (logsRef.current) {
          window.scrollTo({
            top: logsRef.current.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }, 300); // 👈 important delay
    }
  }, [activeReport]);

  const downloadCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Status', 'Violations', 'Emotion', 'Noise', 'Created At'];
    const rows = logs.map(l => [
      l.id,
      l.title,
      l.type,
      l.status,
      l.analysis?.compliance_flags.filter(f => f.category !== 'safe').length || 0,
      l.analysis?.emotion || 'N/A',
      l.analysis?.noise_level || 'N/A',
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditech_compliance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Reports</h1>
          <p className="text-slate-500">Generate and export compliance reports for regulatory bodies.</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <FileDown className="w-5 h-5" /> Export System Audit (CSV)
        </button>
      </div>

{activeReport !== 'logs' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Content Distribution
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Audio Broadcasts</span>
              <span className="text-sm font-bold text-slate-900">{logs.filter(l => l.type === 'AUDIO').length} logs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[65%]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Video Captures</span>
              <span className="text-sm font-bold text-slate-900">{logs.filter(l => l.type === 'VIDEO').length} logs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[35%]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Quick Export Presets
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Weekly Summary', icon: <Calendar /> },
              { label: 'Violations Only', icon: <Download /> },
              { label: 'System Logs', icon: <FileText /> },
              { label: 'AI Insights', icon: <Brain /> },
            ].map((p, i) => (
              <button
  key={i}
  onClick={() => {
    if (i === 0) setActiveReport('weekly');
    if (i === 1) setActiveReport('violations');
    if (i === 2) setActiveReport('logs');
    if (i === 3) setActiveReport('insights');
  }}
  className={`p-4 bg-slate-50 border rounded-xl transition-all text-left hover:bg-white hover:border-blue-500 hover:shadow-md ${
    activeReport === (i === 0 ? 'weekly' : i === 1 ? 'violations' : i === 2 ? 'logs' : 'insights')
      ? 'border-blue-500 shadow-md'
      : 'border-slate-100'
  }`}
>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm text-blue-500">
                  {p.icon}
                </div>
                <p className="text-sm font-bold text-slate-900">{p.label}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Export now</p>
              </button>
            ))}

          </div>
        </div>
      </div>
)}
      {activeReport && (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-6">
    
    {activeReport === 'weekly' && (
  <div>
    <h2 className="text-xl font-bold mb-6">Weekly Summary</h2>

    {/* CARDS */}
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-blue-50 p-6 rounded-xl">
        <p className="text-sm text-blue-600 font-semibold">Total Uploads</p>
        <p className="text-3xl font-bold text-blue-900">{totalLogs}</p>
      </div>

      <div className="bg-red-50 p-6 rounded-xl">
        <p className="text-sm text-red-600 font-semibold">Violations Detected</p>
        <p className="text-3xl font-bold text-red-900">{totalViolations}</p>
      </div>
    </div>

    {/* BAR */}
    <div className="mb-6">
      <p className="text-sm text-slate-600 mb-2">Compliance Overview</p>
      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
        <div
          className="bg-blue-500 h-full"
          style={{ width: `${(totalLogs / (totalLogs + totalViolations)) * 100 || 0}%` }}
        />
        <div
          className="bg-red-500 h-full"
          style={{ width: `${(totalViolations / (totalLogs + totalViolations)) * 100 || 0}%` }}
        />
      </div>
    </div>

    {/* TEXT */}
    <div className="bg-slate-50 p-4 rounded-lg">
      <p className="text-sm text-slate-700">
        This week, you received <span className="font-bold">{totalLogs}</span> uploads, 
        out of which <span className="font-bold text-red-600">{totalViolations}</span> contained violations.
      </p>
    </div>
  </div>
)}

    {activeReport === 'violations' && (
      <div>
      <h2 className="text-xl font-bold mb-6">Violations Overview</h2>
    
      <div className="space-y-6">
        {logs.map(l => {
          const violations = l.analysis?.compliance_flags?.filter(f => f.category !== 'safe') || [];
    
          if (!violations.length) return null;
    
          return (
            <div key={l.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              
              {/* FILE HEADER */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-900">{l.title}</p>
                  <p className="text-xs text-slate-400">{l.type}</p>
                </div>
    
                <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold">
                  {violations.length} Violations
                </span>
              </div>
    
              {/* VIOLATION CARDS */}
              <div className="grid gap-3">
                {violations.map((f, idx) => (
                  <div
                  key={idx}
                  onClick={() => {
                    if (l.type === "AUDIO") {
                      navigate(`/audio?logId=${l.id}`);
                    } else {
                      navigate(`/video?logId=${l.id}`);
                    }
                  }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-500 uppercase">
                        {f.category}
                      </span>
                    </div>
    
                    <p className="text-sm text-slate-700">
                      {f.detected_text || f.text || "No trigger phrase"}
                    </p>
                  </div>
                ))}
              </div>
    
            </div>
          );
        })}
      </div>
    </div>
    )}

{activeReport === 'logs' && (
  <div ref={logsRef} className="space-y-4">

  {/* BACK BUTTON */}
  <button
    onClick={() => setActiveReport(null)}
    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
  >
    ← Back to Reports
  </button>
  
    <h2 className="text-xl font-bold mb-6">System Activity Logs</h2>

    <div className="space-y-4">
      {logs.map(l => (
        <div
        key={l.id}
        onClick={() => {
          if (l.type === "AUDIO") {
            navigate(`/audio?logId=${l.id}`);
          } else {
            navigate(`/video?logId=${l.id}`);
          }
        }}
        className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition flex items-center justify-between cursor-pointer"
      >
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">

            {/* STATUS DOT */}
            <div
              className={`w-3 h-3 rounded-full ${
                l.status === "COMPLETED"
                  ? "bg-green-500"
                  : l.status === "PROCESSING"
                  ? "bg-yellow-500"
                  : l.status === "ERROR"
                  ? "bg-red-500"
                  : "bg-slate-400"
              }`}
            />

            {/* TEXT */}
            <div>
              <p className="text-sm font-bold text-slate-900">
                {l.title}
              </p>

              <p className="text-xs text-slate-500">
                {l.type} • {l.created_at}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="text-right">

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                l.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : l.status === "PROCESSING"
                  ? "bg-yellow-100 text-yellow-700"
                  : l.status === "ERROR"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {l.status}
            </span>

            {/* Violations count */}
            <p className="text-[10px] text-slate-400 mt-1">
              {
                l.analysis?.compliance_flags?.filter(f => f.category !== 'safe').length || 0
              } violations
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


{activeReport === 'insights' && (
  <div>
    <h2 className="text-xl font-bold mb-6">AI Insights</h2>

    {/* CARDS */}
    <div className="grid grid-cols-3 gap-4 mb-6">

      <div className="bg-blue-50 p-5 rounded-xl">
        <p className="text-xs text-blue-600 font-bold">Total Logs</p>
        <p className="text-2xl font-bold text-blue-900">{totalLogs}</p>
      </div>

      <div className="bg-red-50 p-5 rounded-xl">
        <p className="text-xs text-red-600 font-bold">Violations</p>
        <p className="text-2xl font-bold text-red-900">{totalViolations}</p>
      </div>

      <div className="bg-purple-50 p-5 rounded-xl">
        <p className="text-xs text-purple-600 font-bold">Top Violation</p>
        <p className="text-sm font-bold text-purple-900">
          {topViolation || "N/A"}
        </p>
      </div>

    </div>

    {/* INSIGHTS TEXT */}
    <div className="space-y-3">

  {/* LINE 1 */}
  <div className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50">
    <p className="text-sm text-slate-700">
      A total of <span className="font-semibold text-slate-900">{totalLogs}</span> media uploads were processed, 
      with <span className="font-semibold text-red-600">{totalViolations}</span> compliance violations detected.
    </p>
  </div>

  {/* LINE 2 */}
  <div className="w-full p-4 rounded-lg border border-slate-200 bg-blue-50">
    <p className="text-sm text-slate-700">
      The system is primarily handling{" "}
      <span className="font-semibold text-slate-900">
        {audioLogs > videoLogs ? "audio-based" : "video-based"}
      </span>{" "}
      content, indicating higher activity in this category.
    </p>
  </div>

  {/* LINE 3 */}
  <div className="w-full p-4 rounded-lg border border-slate-200 bg-purple-50">
    <p className="text-sm text-slate-700">
      The most frequent violation is{" "}
      <span className="font-semibold text-purple-700">
        {topViolation || "no dominant pattern"}
      </span>, showing a recurring compliance issue.
    </p>
  </div>

  {/* LINE 4 */}
  <div className="w-full p-4 rounded-lg border border-slate-200 bg-red-50">
    <p className="text-sm text-slate-700">
      Overall system risk is{" "}
      <span className={`font-semibold ${
        totalViolations > totalLogs / 2 ? "text-red-600" : "text-green-600"
      }`}>
        {totalViolations > totalLogs / 2 ? "elevated" : "under control"}
      </span>.
    </p>
  </div>

</div>
  </div>
)}

  </div>
)}
    </div>
    
  );
};

export default ReportsView;
