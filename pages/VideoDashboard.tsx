
import React, { useState, useEffect } from 'react';
import { UserProfile, MediaLog, LogType, LogStatus } from '../types';
import { firebaseService } from '../services/firebaseService';
import { transcribeAndAnalyze } from '../services/gemini';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { useLocation } from 'react-router-dom';
import { 
  FileVideo, 
  Upload, 
  Search, 
  Play, 
  ShieldAlert, 
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';

const VideoDashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MediaLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await firebaseService.getLogs(user.id, user.role);
    setLogs(data.filter(l => l.type === LogType.VIDEO));
  };

  
  const location = useLocation();
const [urlLogId, setUrlLogId] = useState<string | null>(null);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const logId = params.get("logId");

  if (logId) {
    setUrlLogId(logId);
  }
}, [location.search]);

useEffect(() => {
  if (!urlLogId || logs.length === 0) return;

  const found = logs.find((l) => String(l.id) === String(urlLogId));

  if (found) {
    setSelectedLog(found);
  }
}, [urlLogId, logs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let log: { id: string } | null = null;
    try {
      // 1. Upload file to Cloudinary
      const storageUrl = await uploadToCloudinary(file);

      // 2. Save metadata to Firestore
      log = await firebaseService.createLog({
        user_id: user.id,
        title: file.name,
        type: LogType.VIDEO,
        storage_path: storageUrl
      });
      await firebaseService.updateLogStatus(log.id, LogStatus.PROCESSING);

      // 3. Process with AI
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = (reader.result as string)?.split(',')[1];
          resolve(result || '');
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      if (!base64) {
        throw new Error('Could not read video file');
      }

      const analysis = await transcribeAndAnalyze(base64, file.type, LogType.VIDEO);

      // 4. Update status
      await firebaseService.updateLogStatus(log.id, LogStatus.COMPLETED, analysis);
      await loadLogs();
    } catch (err) {
      console.error('Video processing failed:', err);
      if (log) {
        try {
          await firebaseService.updateLogStatus(log.id, LogStatus.ERROR);
          await loadLogs();
        } catch (updateErr) {
          console.error('Failed to update error status:', updateErr);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <div className="flex items-center justify-between lg:flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Video Logging Hub</h1>
          <p className="text-slate-500">Monitor visual and auditory compliance for video broadcasts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
  
  {/* LEFT SIDE — Video Archives */}
  <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
    
    <div className="p-6 border-b border-slate-100">
      <h2 className="text-xl font-bold text-slate-900">Video Archives</h2>
      <div className="mt-4">
  <label className={`
    w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
    ${isUploading ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'}
  `}>
    {isUploading ? (
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm font-bold text-blue-600">AI Processing...</p>
      </div>
    ) : (
      <>
        <Upload className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700">Upload New Video</p>
        <p className="text-xs text-slate-500">MP4, MOV up to 100MB</p>
      </>
    )}
    <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} disabled={isUploading} />
  </label>
</div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          onClick={() => setSelectedLog(log)}
          className="bg-slate-50 p-4 rounded-xl cursor-pointer hover:bg-blue-50 transition-all border"
        >
          <p className="font-bold text-sm text-slate-900 truncate">
            {log.title}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(log.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}

      {logs.length === 0 && (
        <div className="text-center text-slate-400 py-10">
          No video logs found.
        </div>
      )}
    </div>
  </div>


  {/* RIGHT SIDE — Analysis Panel */}
  <div className="lg:col-span-2 flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto">

    {selectedLog ? (
      <>
        {/* VIDEO PLAYER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">
            {selectedLog.title}
          </h2>

          <div className="flex justify-center">
  <video
    controls
    className="w-full max-w-lg mx-auto rounded-xl shadow-md"
    src={selectedLog.storage_path}
  />
</div>
        </div>

        <button
  onClick={async () => {
    try {
      if (!selectedLog) return;

      // 🔥 delete log
      await firebaseService.deleteLog(selectedLog.id);

      // 🔥 resolve compliance cases (same as audio)
      await firebaseService.resolveCasesForDeletedLog(user.id, selectedLog.id);

      // 🔥 reset UI
      setSelectedLog(null);
      await loadLogs();

    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  }}
  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
>
  Delete Video
</button>

        {/* SUMMARY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">
            AI Summary
          </h3>
          <p className="text-slate-700">
            {selectedLog.analysis?.summary}
          </p>
        </div>

        {/* TRANSCRIPT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">
            Full Transcript
          </h3>

          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-bold text-xs uppercase text-slate-400 mb-1">
                Urdu
              </p>
              <p className="whitespace-pre-wrap">
                {selectedLog.analysis?.transcript?.urdu}
              </p>
            </div>

            <div>
              <p className="font-bold text-xs uppercase text-slate-400 mb-1">
                English
              </p>
              <p className="whitespace-pre-wrap">
                {selectedLog.analysis?.transcript?.english}
              </p>
            </div>
          </div>
        </div>

{/* KEYWORDS & TAGS */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
    Keywords & Tags
  </h3>

  <div className="flex flex-wrap gap-2 mb-4">
    {(selectedLog.analysis?.keywords ?? []).map((k, i) => (
      <span
        key={i}
        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold"
      >
        {k}
      </span>
    ))}
  </div>

  <div className="flex flex-wrap gap-2">
    {(selectedLog.analysis?.tags ?? []).map((t, i) => (
      <span
        key={i}
        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold"
      >
        #{t}
      </span>
    ))}
  </div>
</div>

{/* AUDIO PROFILE */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
    Audio Profile
  </h3>

  <div className="grid grid-cols-2 gap-4">
    <div className="p-4 bg-slate-50 rounded-xl">
      <p className="text-xs text-slate-400 font-bold uppercase">
        Emotion
      </p>
      <p className="text-sm font-bold text-slate-900 capitalize">
        {selectedLog.analysis?.emotion || "Neutral"}
      </p>
    </div>

    <div className="p-4 bg-slate-50 rounded-xl">
      <p className="text-xs text-slate-400 font-bold uppercase">
        Noise Level
      </p>
      <p className="text-sm font-bold text-slate-900 capitalize">
        {selectedLog.analysis?.noise_level || "Unknown"}
      </p>
    </div>
  </div>
</div>

{/* CONTENT CHAPTERS */}
<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
    Content Chapters
  </h3>

  <div className="space-y-4">
    {(selectedLog.analysis?.chapters ?? []).map((ch, i) => (
      <div
        key={i}
        className="border rounded-xl p-4 bg-slate-50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono bg-slate-900 text-white px-2 py-1 rounded">
            {ch.timestamp}
          </span>

          <span className="text-xs font-bold text-slate-700">
            {ch.title}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-2">
          {ch.description}
        </p>

        <p className="text-xs text-slate-500 whitespace-pre-wrap">
          {ch.transcript_segment}
        </p>
      </div>
    ))}

    {(selectedLog.analysis?.chapters ?? []).length === 0 && (
      <p className="text-sm text-slate-400">
        No chapters generated.
      </p>
    )}
  </div>
</div>

        {/* COMPLIANCE REVIEW */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
    Compliance Review
  </h3>

  {!selectedLog.analysis ? (
    <p className="text-slate-400 text-sm">
      Analysis not completed yet.
    </p>
  ) : (selectedLog.analysis.compliance_flags ?? []).length === 0 ? (
    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
      <p className="text-green-700 font-bold text-sm">
        ✓ No compliance issues detected.
      </p>
    </div>
  ) : (
    (selectedLog.analysis.compliance_flags ?? []).map((flag, i) => (
      <div
        key={i}
        className={`p-4 rounded-xl mb-3 border ${
          flag.category !== "safe"
            ? "bg-red-50 border-red-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase">
            {flag.category}
          </span>
          <span className="text-xs text-slate-500">
            {Math.round(flag.confidence * 100)}%
          </span>
        </div>

        <p className="text-sm font-medium">
          {flag.detected_text}
        </p>

        {flag.timestamp && (
          <p className="text-xs text-slate-400 mt-1">
            Timestamp: {flag.timestamp}
          </p>
        )}
      </div>
    ))
  )}
</div>
      </>
    ) : (
      <div className="flex-1 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <FileVideo className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-bold">No Video Selected</p>
        <p className="text-sm">
          Click a video from the left to view full compliance analysis.
        </p>
      </div>
    )}

  </div>
</div>
    </div>
  );
};

export default VideoDashboard;
