
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, MediaLog, LogType, LogStatus } from '../types';
import { firebaseService } from '../services/firebaseService';
import { transcribeAndAnalyze } from '../services/gemini';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { useSearch } from "../context/SearchContext";
import { useLocation } from 'react-router-dom';
import { 
  FileAudio, 
  Upload, 
  Search, 
  Filter, 
  ChevronRight, 
  Play, 
  Tag, 
  AlertCircle,
  Clock
} from 'lucide-react';

const AudioDashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { query } = useSearch();
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MediaLog | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const transcriptRef = React.useRef<HTMLDivElement | null>(null);
  const [flashTranscript, setFlashTranscript] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [urlLogId, setUrlLogId] = useState<string | null>(null);
const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const logId = params.get("logId");

  if (logId) {
    setUrlLogId(logId);
  }
}, [location.search]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await firebaseService.getLogs(user.id, user.role);
    const filteredLogs = data.filter(l => l.type === LogType.AUDIO);
  
    setLogs(filteredLogs);
  };

  useEffect(() => {
    if (!logs.length) return;
  
    const params = new URLSearchParams(location.search);
    const logId = params.get("logId");
  
    if (logId) {
      const found = logs.find((l) => l.id === logId);
      if (found) {
        setSelectedLog(found);
      }
    }
  }, [logs, location.search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let log: { id: string } | null = null;
    try {
      // 1. Upload file to Cloudinary
      const storageUrl = await uploadToCloudinary(file);
      // 👉 Convert to WAV using Cloudinary
const wavUrl = storageUrl.replace("/upload/", "/upload/f_wav/");

      // 2. Save metadata to Firestore
      log = await firebaseService.createLog({
        user_id: user.id,
        title: file.name,
        type: LogType.AUDIO,
        storage_path: storageUrl
      });
      await firebaseService.updateLogStatus(log.id, LogStatus.PROCESSING);

      // 3. Process with AI (use FileReader for base64 - compatible with all audio formats)
      // 👉 fetch converted WAV
const response = await fetch(wavUrl);
const blob = await response.blob();

// 👉 convert to base64
const base64 = await new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = (reader.result as string)?.split(',')[1];
    resolve(result || '');
  };
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

      if (!base64) {
        throw new Error('Could not read audio file');
      }

      const analysis = await transcribeAndAnalyze(base64, "audio/wav", LogType.AUDIO);

      // 4. Update status
      const cleanAnalysis = analysis ? JSON.parse(JSON.stringify(analysis)) : undefined;
await firebaseService.updateLogStatus(log.id, LogStatus.COMPLETED, cleanAnalysis);
await loadLogs();
    } catch (err) {
      console.error('AI is busy. Please try again in a few seconds:', err);
      if (log) {
        try {
          await firebaseService.updateLogStatus(log.id, LogStatus.PROCESSING);
          await loadLogs();
        } catch (updateErr) {
          console.error('Failed to update error status:', updateErr);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const highlightText = (text: string) => {
    if (!archiveSearch) return text;
  
    return text
      .split(new RegExp(`(${archiveSearch})`, "gi"))
      .map((part, i) =>
        part.toLowerCase() === archiveSearch.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      );
  };
  
  /** Get full transcript as a single string (for search/chapter matching). Handles both { urdu, english } and legacy string. */
  const getFullTranscriptText = (): string => {
    const t = selectedLog?.analysis?.transcript;
    if (!t) return "";
    if (typeof t === "object" && t !== null && "urdu" in t && "english" in t) {
      const o = t as { urdu?: string; english?: string };
      return [o.urdu, o.english].filter(Boolean).join("\n");
    }
    return typeof t === "string" ? t : "";
  };

  const getChapterTranscript = (chapter: any): string => {
    if (!selectedLog?.analysis) return "";
    const t = selectedLog.analysis.transcript;
    const description = chapter.description?.toLowerCase();
    const fullText = getFullTranscriptText();
    if (!fullText) return "";

    if (!description) return "";

    const words = description
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const matchedLines = fullText
      .split(/[.\n]+/)
      .map((s) => s.trim())
      .filter((line) => line && words.some((w) => line.toLowerCase().includes(w)));

    return matchedLines.join(". ");
  };

  console.log("URL logId:", new URLSearchParams(location.search).get("logId"));
console.log("Logs:", logs);

useEffect(() => {
  if (!urlLogId || logs.length === 0) return;

  const found = logs.find((l) => String(l.id) === String(urlLogId));

  if (found) {
    setSelectedLog(found);
  }
}, [urlLogId, logs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500 lg:h-full lg:min-h-0 lg:overflow-hidden">
      {/* Left List */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Audio Archives</h2>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
  type="text"
  value={archiveSearch}
  onChange={(e) => setArchiveSearch(e.target.value)}
  placeholder="Search Transcripts..."
  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
/>
          </div>
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
                <p className="text-sm font-bold text-slate-700">Upload New Broadcast</p>
                <p className="text-xs text-slate-500">MP3, WAV up to 50MB</p>
              </>
            )}
            <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
        {logs
  .filter(log => {
    if (!archiveSearch) return true;
  
    const q = archiveSearch.toLowerCase();
  
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

  .map((log) => (
            <div 
              key={log.id} 
              onClick={() => setSelectedLog(log)}
              className={`p-4 border-b border-slate-50 cursor-pointer transition-all ${selectedLog?.id === log.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 truncate pr-4">{log.title}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded 
  ${
    log.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
    log.status === 'PROCESSING' ? 'bg-amber-100 text-amber-700' :
    log.status === 'PENDING' ? 'bg-blue-100 text-blue-700' :
    'bg-red-100 text-red-700'
  }
`}>
  {log.status === 'COMPLETED' ? 'Completed' :
   log.status === 'PROCESSING' ? 'Processing' :
   log.status === 'PENDING' ? 'Uploading' :
   'Failed'}
</span>


              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleDateString()}</span>
                {log.analysis?.compliance_flags?.some(f => f.category !== 'safe') && (
                  <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3 h-3" /> Flagged</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Analysis Panel */}
      <div className="lg:col-span-2 flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto">
        {selectedLog ? (
          <>
            <button
  disabled={!selectedLog.analysis || selectedLog.status !== LogStatus.COMPLETED}
  onClick={() => {
    if (!selectedLog || !selectedLog.analysis) return;

    const report = {
      id: selectedLog.id,
      title: selectedLog.title,
      created_at: selectedLog.created_at,
      analysis: selectedLog.analysis,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedLog.title.replace(/\s+/g, "_")}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  }}
  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
    ${
      !selectedLog.analysis || selectedLog.status !== LogStatus.COMPLETED
        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
    }
  `}
>
  Download Detailed Report
</button>

{/* AUDIO PLAYER */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
  <h2 className="text-lg font-bold mb-4">
    {selectedLog.title}
  </h2>

  <div className="flex justify-center">
    <audio
      controls
      className="w-full max-w-2xl"
      src={selectedLog.storage_path}
    />
  </div>
</div>

<button
  onClick={async () => {
    try {
      if (!selectedLog) return;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H4',location:'pages/AudioDashboard.tsx:deleteAudio:pre',message:'User delete audio clicked',data:{role:user.role,logId:selectedLog?.id},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log

      // 🔥 delete actual log
      await firebaseService.deleteLog(selectedLog.id);

      // 🔥 resolve compliance cases + stop warning popup
      await firebaseService.resolveCasesForDeletedLog(user.id, selectedLog.id);

      // 🔥 UI cleanup
      setSelectedLog(null);
      await loadLogs();

      // 🔥 navigate back
      window.location.href = "/compliance";

    } catch (err) {
      console.error(err);
      alert("Failed to delete audio");
    }
  }}
  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
>
  Delete Audio
</button>


            {/* Analysis Tabs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transcript & Summary */}
              <div
  ref={transcriptRef}
  className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 transition-all duration-500 ${
    flashTranscript ? "bg-blue-50 border-blue-400 shadow-lg" : ""
  }`}
>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">AI Summary</h3>
                  <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedLog.analysis?.summary &&
                    highlightText(selectedLog.analysis?.summary)}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Full Transcript</h3>
                  <div
                  ref={transcriptRef}
                   className="text-sm text-slate-600 h-64 overflow-y-auto pr-2 leading-relaxed whitespace-pre-wrap"
                   >

{selectedLog.analysis?.transcript && (() => {
  const t = selectedLog.analysis!.transcript as { urdu?: string; english?: string } | string;
  let urduText = "";
  let englishText = "";

  if (typeof t === "object" && t !== null && "urdu" in t && "english" in t) {
    urduText = (t as { urdu?: string; english?: string }).urdu ?? "";
    englishText = (t as { urdu?: string; english?: string }).english ?? "";
  } else if (typeof t === "string") {
    urduText = t.split("(English:")[0]?.trim() ?? t;
    englishText = t.includes("(English:") ? (t.split("(English:")[1]?.replace(/\)\s*$/, "").trim() ?? "") : "";
  }

  const renderLines = (text: string, keyPrefix: string) => {
    if (!text.trim()) return null;
    return text.split("\n").map((line, idx) => {
      const highlight =
        activeChapter !== null &&
        selectedLog.analysis?.chapters &&
        getChapterTranscript(selectedLog.analysis.chapters[activeChapter])
          .toLowerCase()
          .includes(line.toLowerCase());
      return (
        <div
          key={`${keyPrefix}-${idx}`}
          className={`transition-all duration-500 ${highlight ? "bg-yellow-200 px-2 py-1 rounded-md" : ""}`}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Urdu Version</p>
        <div className="text-slate-700">{renderLines(urduText, "urdu") ?? <span className="text-slate-400 italic">No Urdu transcript</span>}</div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase mb-1">English Version</p>
        <div className="text-slate-700">{renderLines(englishText, "eng") ?? <span className="text-slate-400 italic">No English transcript</span>}</div>
      </div>
    </>
  );
})()}

</div>
                </div>
              </div>

              {/* Compliance & Meta */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Compliance Review</h3>
                  <div className="space-y-3">
                    {(selectedLog.analysis?.compliance_flags ?? []).map((flag, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${flag.category !== 'safe' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${flag.category !== 'safe' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                            {flag.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{Math.round(flag.confidence * 100)}% Confidence</span>
                        </div>
                        <p className={`text-sm font-medium ${flag.category !== 'safe' ? 'text-red-900' : 'text-green-900'}`}>
                          {flag.detected_text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Keywords & Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLog.analysis?.keywords ?? []).map((k, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                        {highlightText(k)}
                      </span>
                    ))}
                    {(selectedLog.analysis?.tags ?? []).map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                        #{highlightText(t)}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Audio Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Emotion</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">{selectedLog.analysis?.emotion}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Noise Level</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">{selectedLog.analysis?.noise_level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Content Chapters</h3>
              <div className="space-y-4">
              {(selectedLog.analysis?.chapters ?? []).map((ch, i) => {
  const isOpen = expandedChapter === i;

  // simple keyword extraction from title
  const keywords = ch.title.split(" ");

  // simple compliance logic (if any flags exist in whole file)
  const hasFlags =
    selectedLog.analysis?.compliance_flags?.some(
      (f) => f.category !== "safe"
    ) ?? false;

  return (
    <div
      key={i}
      className="border rounded-2xl p-5 transition-all bg-white hover:shadow-md"
    >
      {/* HEADER ROW */}
      <div
        onClick={() => setExpandedChapter(isOpen ? null : i)}
        className="flex items-center cursor-pointer"
      >
        <div className="bg-slate-900 text-white px-3 py-1 rounded font-mono text-xs mr-4">
          {ch.timestamp}
        </div>

        <h4 className="text-sm font-bold text-slate-900">
          {ch.title}
        </h4>

        {/* Badge */}
        <div className="ml-auto flex items-center gap-3">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              hasFlags
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {hasFlags ? "⚠ Flagged" : "✓ Clean"}
          </span>

          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {isOpen && (
        <div className="mt-5 border-t pt-4 space-y-4 animate-in fade-in duration-300">

          {/* Summary */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">
              Summary
            </p>
            <p className="text-sm text-slate-700">
              {ch.description}
            </p>
          </div>

{/* Actual Transcript: use chapter's transcript_segment from AI, else match from full transcript */}
<div>
  <p className="text-xs font-bold text-slate-400 uppercase mb-1">
    Actual Transcript
  </p>
  <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
    {(ch as { transcript_segment?: string }).transcript_segment?.trim() || getChapterTranscript(ch) || "Relevant transcript not found."}
  </p>
</div>

          {/* Keywords */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">
              Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full"
                >
                  #{word}
                </span>
              ))}
            </div>
          </div>

          {/* Jump Button */}
          <button
  onClick={() => {
    if (!transcriptRef.current) return;

    transcriptRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setFlashTranscript(true);
    setActiveChapter(i); 

    setTimeout(() => {
      setFlashTranscript(false); 
    }, 1500);
  }}
  className="text-blue-600 text-sm font-bold hover:underline"
>
  Jump to transcript →
</button>
        </div>
      )}
    </div>
  );
})}
                    
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FileAudio className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Selection</h3>
            <p className="text-slate-500 max-w-sm">Select an audio log from the sidebar to view full compliance analysis and transcripts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDashboard;
