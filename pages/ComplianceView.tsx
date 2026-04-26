import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { firebaseService } from "../services/firebaseService";
import { increment } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Flag,
} from "lucide-react";

const ComplianceView: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    // User-only: auto-resolve orphan cases (log deleted earlier)
    if (user.role === "STANDARD_USER" && user.id) {
      try {
        await firebaseService.cleanupOrphanComplianceCasesForUser(user.id);
      } catch (_) {
        // keep UI functional even if cleanup fails
      }
    }
    const data = await firebaseService.getComplianceCases(user.id, user.role);
    setCases(data);
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const caseId = params.get("caseId");
  
    if (caseId && cases.length > 0) {
      const found = cases.find(c => c.id === caseId);
      if (found) setSelectedCase(found);
    }
  }, [cases, location.search]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 lg:h-full lg:min-h-0 lg:overflow-hidden">

  {/* LEFT PANEL */}
  <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto">

    <div className="p-6 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-900">Compliance Cases</h2>
    </div>

    {cases.map((caseItem) => (
      <div
        key={caseItem.id}
        onClick={() => setSelectedCase(caseItem)}
        className={`p-4 border-b cursor-pointer transition-all ${
          selectedCase?.id === caseItem.id
            ? "bg-blue-50 border-l-4 border-l-blue-600"
            : "hover:bg-slate-50"
        }`}
      >
        <p className="text-sm font-bold text-slate-900 truncate">
          {caseItem.title}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-slate-500 uppercase">
            {caseItem.content_type}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              caseItem.status === "NEW"
                ? "bg-blue-100 text-blue-700"
                : caseItem.status === "ASSIGNED"
                ? "bg-yellow-100 text-yellow-700"
                : caseItem.status === "RESOLVED"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {caseItem.status}
          </span>
        </div>
      </div>
    ))}
  </div>

  {/* RIGHT PANEL */}
  <div className="lg:col-span-2 flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto">

    {selectedCase ? (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {selectedCase.title}
          </h3>
          <p className="text-sm text-slate-500 uppercase">
            {selectedCase.content_type}
          </p>
        </div>

        {/* Violation */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">
            Violation Type
          </p>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            {selectedCase.violation_type}
          </span>
        </div>

        {/* Trigger */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">
            Triggered Phrase
          </p>
          <p className="italic text-slate-700">
            "{selectedCase.detected_text}"
          </p>
        </div>

        {/* Confidence */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">
            AI Confidence
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-full"
                style={{
                  width: `${(selectedCase.confidence || 0) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600">
              {Math.round((selectedCase.confidence || 0) * 100)}%
            </span>
          </div>
        </div>

{/* ACKNOWLEDGE */}
{user.role === "STANDARD_USER" && selectedCase && (
  <button
    onClick={async () => {
      try {
        if (!selectedCase) return;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H1',location:'pages/ComplianceView.tsx:acknowledge_click:pre',message:'User acknowledge click (pre)',data:{role:user.role,caseId:selectedCase?.id,preUserAcknowledged:selectedCase?.user_acknowledged===true},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log

        await firebaseService.updateComplianceCase(selectedCase.id, {
          user_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        });

        await firebaseService.markNotificationAsRead(selectedCase.id);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H2',location:'pages/ComplianceView.tsx:acknowledge_click:postWrites',message:'Acknowledge writes finished',data:{caseId:selectedCase?.id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log

        // 🔥 refresh + reselect (already working)
        const updatedCases = await firebaseService.getComplianceCases(user.id, user.role);
        setCases(updatedCases);

        const updated = updatedCases.find(c => c.id === selectedCase.id);
        if (updated) {
          setSelectedCase(updated);
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H1',location:'pages/ComplianceView.tsx:acknowledge_click:postRefresh',message:'After refresh, case ack state',data:{caseId:selectedCase?.id,postUserAcknowledged:updated?.user_acknowledged===true,hasUpdatedCase:!!updated},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log

      } catch (err) {
        console.error(err);
        alert("Failed to acknowledge");
      }
    }}

    disabled={selectedCase.user_acknowledged === true}

    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
      ${
        selectedCase.user_acknowledged === true
          ? "bg-green-600 text-white cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }
    `}
  >
    {selectedCase.user_acknowledged === true ? "Acknowledged" : "Acknowledge"}
  </button>
)}


{/* DELETE CONTENT */}

{user.role === "STANDARD_USER" && selectedCase && (
  <button
    onClick={() => {
      if (selectedCase.content_type === "AUDIO") {
        navigate(`/audio?logId=${selectedCase.log_id}`);
      } else {
        navigate(`/video?logId=${selectedCase.log_id}`);
      }
    }}
    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
  >
    Delete Content
  </button>
)}

{/* ADMIN NOTE */}
<div>
  <p className="text-xs font-bold text-slate-400 uppercase mb-2">
    Admin Note
  </p>

  <textarea
    value={selectedCase.admin_note || ""}
    onChange={(e) =>
      user.role === "ADMIN" &&
      setSelectedCase({
        ...selectedCase,
        admin_note: e.target.value,
      })
    }
    disabled={user.role !== "ADMIN"}
    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
    placeholder="Admin instructions or context..."
  />
</div>

{/* ACTIONS TO TAKE */}
{user.role === "COMPLIANCE_OFFICER" &&
 selectedCase.status === "ASSIGNED" && (
  <div className="mt-5">
    
    <p className="text-xs font-bold text-slate-400 uppercase mb-3">
      Actions to Take
    </p>

    <div className="flex flex-wrap gap-3">

      {/* SEND WARNING */}
      <button
  onClick={async () => {
    try {
      const log = await firebaseService.getLogById(selectedCase.log_id);

      if (!log || !log.user_id) {
        alert("User not found");
        return;
      }

      // save action in case
      await firebaseService.updateComplianceCase(selectedCase.id, {
        action_taken: "WARNING_SENT"
      });

      // create warning notification
      await firebaseService.createUserNotification(
        log.user_id,
        `Warning issued for your content: "${selectedCase.title}". Please review compliance guidelines.`,
        selectedCase.id
      );

      // update UI
      setSelectedCase({
        ...selectedCase,
        action_taken: "WARNING_SENT"
      });

      alert("Warning sent to user");
    } catch (error) {
      console.error(error);
      alert("Failed to send warning");
    }
  }}
  className={`px-3 py-2 rounded-lg text-xs font-bold ${
    selectedCase.action_taken === "WARNING_SENT"
      ? "bg-green-600 text-white"
      : "bg-yellow-500 text-white"
  }`}
>
  {selectedCase.action_taken === "WARNING_SENT"
    ? "Warning Sent"
    : "Send Warning"}
</button>

      {/* ISSUE PENALTY */}
      <button
        onClick={async () => {
          const log = await firebaseService.getLogById(
            selectedCase.log_id
          );
          if (!log || !log.user_id) return;

          await firebaseService.updateUser(log.user_id, {
            fines: increment(1),
          });

          await firebaseService.updateComplianceCase(selectedCase.id, {
            action_taken: "PENALTY_ISSUED",
          });

          await firebaseService.createUserNotification(
            log.user_id,
            `A penalty has been issued on your content: "${selectedCase.title}". A fine will be applied to your account.`,
            selectedCase.id
          );

          setSelectedCase({
            ...selectedCase,
            action_taken: "PENALTY_ISSUED",
          });
        }}
        className={`px-3 py-2 rounded-lg text-xs font-bold ${
          selectedCase.action_taken === "PENALTY_ISSUED"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        {selectedCase.action_taken === "PENALTY_ISSUED"
          ? "Penalty Issued"
          : "Issue Penalty"}
      </button>


      {/* RESTRICT CONTENT */}
      <button
        onClick={async () => {
          const log = await firebaseService.getLogById(selectedCase.log_id);
if (!log || !log.user_id) return;

await firebaseService.updateComplianceCase(selectedCase.id, {
  action_taken: "CONTENT_RESTRICTED",
});

// 🔥 NOTIFICATION
await firebaseService.createUserNotification(
  log.user_id,
  `Your content "${selectedCase.title}" has been restricted. Please review and remove it if necessary.`,
  selectedCase.id
);

setSelectedCase({
  ...selectedCase,
  action_taken: "CONTENT_RESTRICTED",
});
        }}
        className={`px-3 py-2 rounded-lg text-xs font-bold ${
          selectedCase.action_taken === "CONTENT_RESTRICTED"
            ? "bg-green-600 text-white"
            : "bg-black text-white"
        }`}
      >
        {selectedCase.action_taken === "CONTENT_RESTRICTED"
          ? "Content Restricted"
          : "Restrict Content"}
      </button>


      {/* ESCALATE */}
      <button
        onClick={async () => {
          const log = await firebaseService.getLogById(selectedCase.log_id);
          if (!log || !log.user_id) return;
          
          await firebaseService.updateComplianceCase(selectedCase.id, {
            action_taken: "ESCALATED",
          });
          
          // 🔥 NOTIFICATION
          await firebaseService.createUserNotification(
            log.user_id,
            `Your content "${selectedCase.title}" has been escalated for further review. Admin may take additional action.`,
            selectedCase.id
          );
          
          setSelectedCase({
            ...selectedCase,
            action_taken: "ESCALATED",
          });
          
        }}
        className={`px-3 py-2 rounded-lg text-xs font-bold ${
          selectedCase.action_taken === "ESCALATED"
            ? "bg-green-600 text-white"
            : "bg-purple-600 text-white"
        }`}
      >
        {selectedCase.action_taken === "ESCALATED"
          ? "Escalated"
          : "Escalate to Authority"}
      </button>

    </div>
  </div>
)}

{/* OFFICER NOTE */}
<div>
  <p className="text-xs font-bold text-slate-400 uppercase mb-2 mt-4">
    Officer Review Note
  </p>

  <textarea
    value={selectedCase.officer_note || ""}
    onChange={(e) =>
      user.role === "COMPLIANCE_OFFICER" &&
      setSelectedCase({
        ...selectedCase,
        officer_note: e.target.value,
      })
    }
    disabled={user.role !== "COMPLIANCE_OFFICER"}
    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
    placeholder="Officer decision explanation..."
  />
  {user.role === "COMPLIANCE_OFFICER" && (
  <select
    value={selectedCase.action_taken || ""}
    onChange={(e) =>
      setSelectedCase({
        ...selectedCase,
        action_taken: e.target.value,
      })
    }
    className="w-full border border-slate-200 rounded-lg p-2 text-sm mt-3"
  >
    <option value="">Select Action Taken</option>
    <option value="WARNING">Warning Issued</option>
    <option value="FINE">Financial Penalty Issued</option>
    <option value="CLEARED">Content Restricted</option>
    <option value="ESCALATED">Escalated to Authority</option>
    <option value="NO_VIOLATION">No Violation</option>
  </select>
)}

</div>

        {/* ACTIONS */}
        <div className="pt-4 border-t space-x-2">

        <button
  onClick={async () => {
    await firebaseService.updateComplianceCase(selectedCase.id, {
      admin_note: selectedCase.admin_note || "",
      officer_note: selectedCase.officer_note || "",
    });

    loadCases();
  }}
  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold"
>
  Save Notes
</button>

          {user.role === "ADMIN" && selectedCase.status === "NEW" && (
            <button
            onClick={async () => {
              await firebaseService.updateComplianceCase(selectedCase.id, {
                status: "ASSIGNED",
                assigned_to: "E8JEanriXYfunpTtgXEOlsdDGOw2"
              });
            
              const updatedCase = {
                ...selectedCase,
                status: "ASSIGNED",
              };
            
              setSelectedCase(updatedCase);
            
              loadCases();
            }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
            >
              Assign to Officer
            </button>
          )}
          {user.role === "ADMIN" && selectedCase.status === "ASSIGNED" && (
  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold">
    Assigned
  </span>
)}

{user.role === "COMPLIANCE_OFFICER" &&
  selectedCase.status === "ASSIGNED" && (
    <button
      onClick={async () => {
        await firebaseService.updateComplianceCase(selectedCase.id, {
          status: "RESOLVED",
          officer_note: selectedCase.officer_note || "",
          action_taken: selectedCase.action_taken,
        });

        loadCases();
      }}
      disabled={!selectedCase.action_taken}
      className={`px-4 py-2 rounded-lg text-sm font-bold ${
        selectedCase.user_acknowledged
          ? "bg-green-600 text-white"
          : "bg-slate-300 text-slate-500 cursor-not-allowed"
      }`}
    >
      Mark as Resolved
    </button>
)}

        </div>

      </div>
    ) : (
      <div className="flex-1 bg-white rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
        Select a compliance case to review details.
      </div>
    )}

  </div>
</div>
  );
};

const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default ComplianceView;
