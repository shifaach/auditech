import { MediaLog, LogStatus, AnalysisResult } from "../types";
import { db } from "./firebaseClient";
import { onSnapshot } from "firebase/firestore";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

const LOGS_COLLECTION = "logs";

export const firebaseService = {

  getLogs: async (userId?: string, role?: string): Promise<MediaLog[]> => {
    const logsRef = collection(db, LOGS_COLLECTION);

    const isPrivileged =
      role === "ADMIN" || role === "COMPLIANCE_OFFICER";

    const q = isPrivileged
      ? query(logsRef, orderBy("created_at", "desc"))
      : !userId
      ? null
      : query(
          logsRef,
          where("user_id", "==", userId),
          orderBy("created_at", "desc")
        );

    if (!q) return [];

    const snapshot = await getDocs(q);

    const logs: MediaLog[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<MediaLog, "id"> &
        Partial<Pick<MediaLog, "id">>;

      return {
        id: data.id || docSnap.id,
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        storage_path: data.storage_path,
        status: data.status,
        created_at: data.created_at,
        analysis: data.analysis,
      };
    });

    return logs.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  },

  createLog: async (
    log: Omit<MediaLog, "id" | "created_at" | "status">
  ): Promise<MediaLog> => {
    const createdAt = new Date().toISOString();
    const status = LogStatus.PENDING;

    const logsRef = collection(db, LOGS_COLLECTION);
    const docRef = await addDoc(logsRef, {
      ...log,
      created_at: createdAt,
      status,
    });

    await updateDoc(docRef, { id: docRef.id });

    return {
      id: docRef.id,
      ...log,
      created_at: createdAt,
      status,
    };
  },

  updateLogStatus: async (
    id: string,
    status: LogStatus,
    analysis?: AnalysisResult
  ): Promise<void> => {
    const logRef = doc(db, LOGS_COLLECTION, id);
    const updateData: Record<string, unknown> = { status };

    if (analysis) {
      updateData.analysis = JSON.parse(JSON.stringify(analysis));

      if (analysis.compliance_flags?.length) {

        const logSnap = await getDoc(doc(db, LOGS_COLLECTION, id));

if (!logSnap.exists()) return;

const logData = logSnap.data();

for (const flag of analysis.compliance_flags) {
  if (flag.category !== "safe") {
    await firebaseService.createComplianceCase({
      log_id: id,
      user_id: logData.user_id,
      title: logData.title,
      content_type: logData.type,   // 🔥 no fallback
      violation_type: flag.category,
      detected_text: flag.detected_text,
      confidence: flag.confidence,
      timestamp: flag.timestamp || null,
    });
  }
}
      }
    }

    await updateDoc(logRef, updateData);
  },

  deleteLog: async (id: string): Promise<void> => {
    const logRef = doc(db, LOGS_COLLECTION, id);
    await deleteDoc(logRef);
  },

  createComplianceCase: async (caseData: any): Promise<string> => {
    const casesRef = collection(db, "compliance_cases");
  
    const OFFICER_ID = "E8JEanriXYfunpTtgXEOlsdDGOw2";
  
    const docRef = await addDoc(casesRef, {
      ...caseData,
      status: "NEW", // 🔥 keep NEW (since admin assigns)
      priority: "MEDIUM",
      assigned_to: null, // 🔥 NO AUTO ASSIGN (as you want)
      admin_note: "",
      officer_note: "",
      user_acknowledged: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  
    return docRef.id;
  },

  getComplianceCases: async (userId?: string, role?: string) => {
    const casesRef = collection(db, "compliance_cases");
  
    let q;
  
    if (role === "ADMIN") {
      q = query(casesRef, orderBy("created_at", "desc"));
    } 
    else if (role === "COMPLIANCE_OFFICER") {
      q = query(
        casesRef,
        where("assigned_to", "==", userId),
        orderBy("created_at", "desc")
      );
    } 
    else {
      // 👤 USER sees only when officer has taken action
      q = query(
        casesRef,
        where("user_id", "==", userId),
        orderBy("created_at", "desc")
      );
    }
  
    const snapshot = await getDocs(q);

let data = snapshot.docs.map(docSnap => ({
  id: docSnap.id,
  ...(docSnap.data() as any),
}));

// 🔥 FILTER ONLY CASES WHERE OFFICER TOOK ACTION
if (role !== "ADMIN" && role !== "COMPLIANCE_OFFICER") {
  data = data.filter(c => c.action_taken);
}

return data;
  },

  updateComplianceCase: async (
    caseId: string,
    updates: any
  ): Promise<void> => {
    const caseRef = doc(db, "compliance_cases", caseId);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H1',location:'services/firebaseService.ts:updateComplianceCase:pre',message:'updateComplianceCase called',data:{caseId,keys:Object.keys(updates||{}),hasUserAcknowledged:typeof updates?.user_acknowledged==='boolean'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    await updateDoc(caseRef, {
      ...updates,
      user_acknowledged: updates.user_acknowledged ?? false,
      updated_at: serverTimestamp(),
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H1',location:'services/firebaseService.ts:updateComplianceCase:post',message:'updateComplianceCase finished',data:{caseId,wroteUserAcknowledged:(updates?.user_acknowledged??false)===true},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  },
  
  updateComplianceCaseStatus: async (
    caseId: string,
    status: string,
    updates?: any
  ): Promise<void> => {
    const caseRef = doc(db, "compliance_cases", caseId);

    await updateDoc(caseRef, {
      status,
      ...updates,
      updated_at: serverTimestamp(),
    });
  },

  updateUser: async (
    userId: string,
    updates: any
  ): Promise<void> => {
    const userRef = doc(db, "users", userId);
  
    await updateDoc(userRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  },

  getLogById: async (logId: string): Promise<MediaLog | null> => {
    const logRef = doc(db, "logs", logId);
    const snapshot = await getDoc(logRef);
  
    if (!snapshot.exists()) return null;
  
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<MediaLog, "id">),
    };
  },

  createUserNotification: async (
    userId: string,
    message: string,
    caseId?: string
  ): Promise<void> => {
    const notificationsRef = collection(db, "user_notifications");
  
    await addDoc(notificationsRef, {
      user_id: userId,
      message,
      case_id: caseId || null,
      created_at: serverTimestamp(),
      read: false,
    });
  },

  getUsers: async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
  
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },

  getUserNotifications: async (userId: string) => {
    const notificationsRef = collection(db, "user_notifications");
  
    const q = query(
      notificationsRef,
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );
  
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  subscribeToUserNotifications: (userId: string, callback: any) => {
    const notificationsRef = collection(db, "user_notifications");
  
    const q = query(
      notificationsRef,
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );
  
    let isInitialLoad = true;
  
    return onSnapshot(q, (snapshot) => {
  
      // 🔥 Detect NEW notifications ONLY
      if (!isInitialLoad) {
      
      }
  
      isInitialLoad = false;
  
      const data = snapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .filter((n: any) => n.read === false);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H3',location:'services/firebaseService.ts:subscribeToUserNotifications:snapshot',message:'Notifications snapshot (unread filtered)',data:{unreadCount:data.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log

      callback(data);
    });
  },

  markNotificationAsRead: async (caseId: string) => {
    const notificationsRef = collection(db, "user_notifications");
  
    const q = query(
      notificationsRef,
      where("case_id", "==", caseId)
    );
  
    const snapshot = await getDocs(q);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H2',location:'services/firebaseService.ts:markNotificationAsRead:pre',message:'markNotificationAsRead query result',data:{caseId,matchedDocs:snapshot.docs.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "user_notifications", docSnap.id), {
        read: true,
      });
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H2',location:'services/firebaseService.ts:markNotificationAsRead:post',message:'markNotificationAsRead finished',data:{caseId,updatedDocs:snapshot.docs.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  },

  resolveCasesForDeletedLog: async (userId: string, logId: string) => {
    // Find all compliance cases tied to this deleted log for this user,
    // mark them resolved + acknowledged, and stop related user popups by marking notifications read.
    const casesRef = collection(db, "compliance_cases");
    const qCases = query(
      casesRef,
      where("user_id", "==", userId),
      where("log_id", "==", logId)
    );

    const snap = await getDocs(qCases);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H4',location:'services/firebaseService.ts:resolveCasesForDeletedLog:query',message:'resolveCasesForDeletedLog matched cases',data:{userIdPresent:!!userId,logIdPresent:!!logId,matchedCases:snap.docs.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    const caseIds: string[] = [];

    for (const docSnap of snap.docs) {
      const caseId = docSnap.id;
      caseIds.push(caseId);

      await updateDoc(doc(db, "compliance_cases", caseId), {
        status: "RESOLVED",
        user_acknowledged: true,
        user_action: "DELETED_CONTENT",
        resolved_at: new Date().toISOString(),
        updated_at: serverTimestamp(),
      });

      await firebaseService.markNotificationAsRead(caseId);
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H4',location:'services/firebaseService.ts:resolveCasesForDeletedLog:done',message:'resolveCasesForDeletedLog finished',data:{updatedCases:caseIds.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  },

  cleanupOrphanComplianceCasesForUser: async (userId: string) => {
    // Orphan = compliance case references a log_id that no longer exists.
    // User-only cleanup: resolve those cases and stop related popups.
    const casesRef = collection(db, "compliance_cases");
    const qCases = query(casesRef, where("user_id", "==", userId));
    const snap = await getDocs(qCases);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H5',location:'services/firebaseService.ts:cleanupOrphanComplianceCasesForUser:start',message:'Starting orphan compliance cleanup',data:{userIdPresent:!!userId,casesFetched:snap.docs.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    let orphanResolved = 0;
    let checked = 0;

    for (const docSnap of snap.docs) {
      const c: any = docSnap.data();
      const caseId = docSnap.id;
      const logId = c?.log_id;
      if (!logId) continue;

      // Skip already resolved
      if (c?.status === "RESOLVED") continue;

      checked += 1;
      const log = await firebaseService.getLogById(String(logId));

      if (!log) {
        orphanResolved += 1;
        await updateDoc(doc(db, "compliance_cases", caseId), {
          status: "RESOLVED",
          user_acknowledged: true,
          user_action: "CONTENT_DELETED_OR_MISSING",
          resolved_at: new Date().toISOString(),
          updated_at: serverTimestamp(),
        });

        await firebaseService.markNotificationAsRead(caseId);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H5',location:'services/firebaseService.ts:cleanupOrphanComplianceCasesForUser:orphan',message:'Resolved orphan compliance case (missing log)',data:{caseId,logId:String(logId)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H5',location:'services/firebaseService.ts:cleanupOrphanComplianceCasesForUser:done',message:'Finished orphan compliance cleanup',data:{checkedCasesWithLogId:checked,orphanResolved},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  },

  cleanupUserNotificationsWithoutCaseId: async (userId: string) => {
    // Old/stale notifications may have case_id null/missing. They can cause the popup forever.
    // We auto-mark them read for this user.
    const notificationsRef = collection(db, "user_notifications");
    const q = query(
      notificationsRef,
      where("user_id", "==", userId),
      where("read", "==", false),
      where("case_id", "==", null)
    );

    const snap = await getDocs(q);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H6',location:'services/firebaseService.ts:cleanupUserNotificationsWithoutCaseId:pre',message:'cleanupUserNotificationsWithoutCaseId matched docs',data:{matchedDocs:snap.docs.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    for (const docSnap of snap.docs) {
      await updateDoc(doc(db, "user_notifications", docSnap.id), {
        read: true,
      });
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cd081d61-ec6b-491b-8c30-75e567418c65',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57e2c9'},body:JSON.stringify({sessionId:'57e2c9',runId:'pre-fix',hypothesisId:'H6',location:'services/firebaseService.ts:cleanupUserNotificationsWithoutCaseId:post',message:'cleanupUserNotificationsWithoutCaseId finished',data:{updatedDocs:snap.docs.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
  },

  deleteUser: async (userId: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  },

};