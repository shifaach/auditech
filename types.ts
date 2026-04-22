
export enum UserRole {
  ADMIN = 'ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  STANDARD_USER = 'STANDARD_USER'
}

export enum LogStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum LogType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface AnalysisChapter {
  title: string;
  timestamp: string;
  description: string;
  transcript_segment: string;
}

export interface ComplianceFlag {
  category: 'vulgar' | 'abusive' | 'inappropriate' | 'safe';
  detected_text: string;
  confidence: number;
  timestamp?: string;
}

export interface AnalysisResult {
  id: string;
  log_id: string;
  transcript: {
    urdu: string;
    english: string;
  };
  summary: string;
  keywords: string[];
  tags: string[];
  topics: string[];
  emotion: string;
  noise_level: string;
  chapters: AnalysisChapter[];
  compliance_flags: ComplianceFlag[];
  confidence_score: number;
}

export interface MediaLog {
  id: string;
  user_id: string;
  type: LogType;
  title: string;
  storage_path: string;
  status: LogStatus;
  created_at: string;
  analysis?: AnalysisResult;
}

export enum CaseStatus {
  NEW = "NEW",
  UNDER_REVIEW = "UNDER_REVIEW",
  ASSIGNED = "ASSIGNED",
  ACTION_TAKEN = "ACTION_TAKEN",
  RESOLVED = "RESOLVED"
}