import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, MediaLog, LogStatus } from '../types';
import { firebaseService } from '../services/firebaseService';
import { useSearch } from "../context/SearchContext";
import { 
  FileAudio, 
  FileVideo, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Plus,
  Bell
} from 'lucide-react';

const Dashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { query } = useSearch();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [activeWarning, setActiveWarning] = useState<any>(null);
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    pending: 0,
    processed: 0
  });

  const [showUploadModal, setShowUploadModal] = useState(false);

  const latestCompletedLog = logs
  .filter(log => log.status === LogStatus.COMPLETED)
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const notifications: any[] = [
    ...userNotifications,
    ...logs
      .filter(
        log =>
          log.status === LogStatus.COMPLETED ||
          log.status === LogStatus.ERROR ||
          log.analysis?.compliance_flags?.some(f => f.category !== "safe")
      )
      .map(log => ({
        id: log.id,
        type: "log",
        title: log.title,
        status: log.status,
        created_at: log.created_at,
        flagged: log.analysis?.compliance_flags?.some(f => f.category !== "safe")
      }))
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowUploadModal(false);
    };
  
    if (showUploadModal) {
      window.addEventListener("keydown", handleEsc);
    }
  
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showUploadModal]);

  useEffect(() => {
    if (!user?.id) return;
  
    loadLogs();

    // User-only: cleanup orphan compliance cases to stop stale popups
    if (user.role === "STANDARD_USER") {
      firebaseService.cleanupOrphanComplianceCasesForUser(user.id).catch(() => {});
      firebaseService.cleanupUserNotificationsWithoutCaseId(user.id).catch(() => {});
    }
  
    const unsubscribe = firebaseService.subscribeToUserNotifications(
      user.id,
      (data: any) => {
    
        // detect new notification
    
        setUserNotifications(data);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H3',location:'pages/Dashboard.tsx:notifications_cb:pre',message:'Dashboard notifications callback',data:{role:user.role,unreadCount:data?.length||0,hasActiveWarning:!!activeWarning,shownIdsCount:shownIds.length,latestId:data?.[0]?.id,latestHasCaseId:!!data?.[0]?.case_id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log

if (data.length > 0) {
  const latest = data[0];

  // Only show popup for compliance notifications that can be reviewed (must have case_id)
  if (latest?.message && latest?.case_id && !shownIds.includes(latest.id)) {
    setActiveWarning(latest);
    setShownIds(prev => [...prev, latest.id]);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H3',location:'pages/Dashboard.tsx:notifications_cb:setActive',message:'Active warning set from latest unread',data:{latestId:latest?.id,caseIdPresent:!!latest?.case_id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  }
}
      }
    );
  
    return () => unsubscribe();
  
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadLogs = async () => {
    const data = await firebaseService.getLogs(user.id, user.role);
    setLogs(data);
    setStats({
      total: data.length,
      flagged: data.filter(l => l.analysis?.compliance_flags.some(f => f.category !== 'safe')).length,
      pending: data.filter(l => l.status === LogStatus.PENDING).length,
      processed: data.filter(l => l.status === LogStatus.COMPLETED).length
    });
  };

  return (
    <>
    {activeWarning && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
    
    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
      
      <h2 className="text-lg font-bold text-red-600 mb-3">
        ⚠ Compliance Warning
      </h2>

      <p className="text-sm text-slate-700 mb-6">
        {activeWarning.message}
      </p>

      <div className="flex justify-end gap-2">
        
        <button
          onClick={() => setActiveWarning(null)}
          className="px-4 py-2 text-sm font-bold bg-slate-100 rounded-lg"
        >
          Dismiss
        </button>

        <button
  onClick={() => {
    navigate(`/compliance?caseId=${activeWarning?.case_id}`); // 🔥 CASE PASS
    setActiveWarning(null); // close modal
  }}
  className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg"
>
  Review
</button>

      </div>

    </div>
  </div>
)}
    <div className="space-y-8 animate-in fade-in duration-500">
    
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
    <p className="text-slate-500">
      Welcome back, {user.full_name}. Here is what's happening today.
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-3">

    {/* 🔔 Notification Bell */}
    <div className="relative" ref={notificationRef}>
      <Bell
        className="w-6 h-6 text-slate-600 cursor-pointer"
        onClick={() => setShowNotifications(!showNotifications)}
      />

      {notifications.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
          {notifications.length}
        </span>
      )}

      {showNotifications && (
        <div className="absolute right-0 mt-3 w-[90vw] bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Notifications
          </h3>

          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">
              No notifications available.
            </p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="mb-3 pb-3 border-b last:border-none">
            
                {n.message ? (
                  <>
                    <div className="flex items-center justify-between">
  <p className="text-sm font-bold text-slate-900">
    Compliance Notification
  </p>
  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
    NEW
  </span>
</div>
                    <p className="text-xs text-slate-500">
                      {n.message}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900">
                      {n.title}
                    </p>
            
                    <p className="text-xs text-slate-500">
                      {n.status === LogStatus.COMPLETED && "Processing completed successfully"}
                      {n.status === LogStatus.ERROR && "Processing failed"}
                      {n.flagged && " Compliance flag detected"}
                    </p>
                  </>
                )}
            
                <p className="text-[10px] text-slate-400 mt-1">
                  {n.created_at?.seconds
                    ? new Date(n.created_at.seconds * 1000).toLocaleString()
                    : new Date(n.created_at).toLocaleString()}
                </p>
            
              </div>
            ))
          )}
        </div>
      )}
    </div>

    {/* New Log Button */}
    <button
      onClick={() => setShowUploadModal(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
    >
      <Plus className="w-5 h-5" /> New Log
    </button>

  </div>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Logs', value: stats.total, icon: <FileAudio className="text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Compliance Flags', value: stats.flagged, icon: <AlertTriangle className="text-red-600" />, color: 'bg-red-50' },
          { label: 'Processing Files', value: stats.pending, icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Upload Success Rate', value: stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) + '%' : '0%', icon: <CheckCircle2 className="text-green-600" />, color: 'bg-green-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Compliance Logs</h2>
            <button
  onClick={() => {
    console.log("VIEW ALL CLICKED");
    navigate("/reports?view=logs");
  }}
  className="text-blue-600 text-sm font-bold hover:underline cursor-pointer"
>
  View All
</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Flag</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {logs
  .filter(log => {
    if (!query) return true;
  
    const q = query.toLowerCase();
  
    const transcriptText =
      typeof log.analysis?.transcript === "string"
        ? log.analysis.transcript
        : log.analysis?.transcript?.english || "";
  
    const keywordsText = Array.isArray(log.analysis?.keywords)
      ? log.analysis.keywords.join(" ")
      : "";
  
    const tagsText = Array.isArray(log.analysis?.tags)
      ? log.analysis.tags.join(" ")
      : "";
  
    return (
      log.title?.toLowerCase().includes(q) ||
      transcriptText.toLowerCase().includes(q) ||
      keywordsText.toLowerCase().includes(q) ||
      tagsText.toLowerCase().includes(q)
    );
  })

  .slice(0, 5)
  .map((log) => (
    <tr
    key={log.id}
    onClick={() => {
      if (log.type === "AUDIO") {
        navigate(`/audio?logId=${log.id}`);
      } else {
        navigate(`/video?logId=${log.id}`);
      }
    }}
    className="hover:bg-slate-50 transition-colors cursor-pointer"
  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {log.type === 'AUDIO' ? <FileAudio className="w-4 h-4 text-blue-500" /> : <FileVideo className="w-4 h-4 text-purple-500" />}
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.title}</p>
                          <p className="text-xs text-slate-500 truncate w-32">{log.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        log.status === LogStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                        log.status === LogStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.analysis?.compliance_flags.some(f => f.category !== 'safe') ? (
                        <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Clean
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No logs found. Upload your first media file to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Compliance Health
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={(2 * Math.PI * 56) * (1 - (stats.processed / (stats.total || 1)))}
                  className="text-blue-600 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Analysis Done</span>
              </div>
            </div>
            <div className="mt-8 w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Vulgarity detected</span>
                <span className="text-xs font-bold text-red-600">{logs.filter(l =>
  (l.analysis?.compliance_flags ?? []).some(f =>
    f.category?.toLowerCase().includes("vulgar")
  )
).length} hits</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[15%]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Hate Speech</span>
                <span className="text-xs font-bold text-amber-600">{logs.filter(l =>
  (l.analysis?.compliance_flags ?? []).some(f =>
    f.category?.toLowerCase().includes("abuse") ||
    f.category?.toLowerCase().includes("hate")
  )
).length} hits</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[8%]" />
              </div>
            </div>
          </div>
          <button
  onClick={() => {
    if (!latestCompletedLog) {
      alert("No completed reports available");
      return;
    }

    const jsonData = JSON.stringify(latestCompletedLog, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "overview_report.json");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }}
  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
>
  Download Detailed Report
</button>
        </div>
      </div>
      {showUploadModal && (
  <div
  className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]"
  onClick={() => setShowUploadModal(false)}
>

<div
  onClick={(e) => e.stopPropagation()}
  className="bg-white rounded-2xl p-6 w-[90%] max-w-sm space-y-5"
>

      <h2 className="text-lg font-bold text-slate-900 text-center">
        Create New Log
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {/* AUDIO */}
        <button
          onClick={() => {
            setShowUploadModal(false);
            navigate("/audio");
          }}
          className="p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition text-center"
        >
          <FileAudio className="w-8 h-8 mx-auto text-blue-600 mb-2" />
          <p className="text-sm font-bold text-slate-900">Audio</p>
        </button>

        {/* VIDEO */}
        <button
          onClick={() => {
            setShowUploadModal(false);
            navigate("/video");
          }}
          className="p-5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition text-center"
        >
          <FileVideo className="w-8 h-8 mx-auto text-purple-600 mb-2" />
          <p className="text-sm font-bold text-slate-900">Video</p>
        </button>

      </div>

      <button
        onClick={() => setShowUploadModal(false)}
        className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700"
      >
        Cancel
      </button>

    </div>
  </div>
)}

    </div>
    </>
    
  );
};

const ShieldCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Dashboard;
