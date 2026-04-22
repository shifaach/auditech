
import React from 'react';
import { 
  Home, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  FileAudio, 
  FileVideo, 
  FileText 
} from 'lucide-react';

export const NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: <Home className="w-5 h-5" />, roles: ['ADMIN', 'COMPLIANCE_OFFICER', 'STANDARD_USER'] },
  { name: 'Audio Logs', path: '/audio', icon: <FileAudio className="w-5 h-5" />, roles: ['ADMIN', 'COMPLIANCE_OFFICER', 'STANDARD_USER'] },
  { name: 'Video Logs', path: '/video', icon: <FileVideo className="w-5 h-5" />, roles: ['ADMIN', 'COMPLIANCE_OFFICER', 'STANDARD_USER'] },
  { name: 'Compliance', path: '/compliance', icon: <ShieldAlert className="w-5 h-5" />, roles: ['ADMIN', 'COMPLIANCE_OFFICER', 'STANDARD_USER'] },
  { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['ADMIN', 'COMPLIANCE_OFFICER'] },
  { name: 'User Management', path: '/admin', icon: <Settings className="w-5 h-5" />, roles: ['ADMIN'] },
];

export const MOCK_USER: any = {
  id: 'user_123',
  email: 'admin@auditech.pk',
  role: 'ADMIN',
  full_name: 'Super Admin'
};
