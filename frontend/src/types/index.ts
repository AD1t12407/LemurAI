export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface Meeting {
  meetingLink: string;
  description: string;
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: Attendee[];
  status: MeetingStatus;
  transcript?: string;
  summary?: string;
  actionItems?: ActionItem[];
  tags?: string[];
  recordingUrl?: string;
  joinUrl?: string;
  platform?: 'zoom' | 'teams' | 'meet' | 'other';
  clientId?: string;
  meetingType?: 'internal' | 'external';
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  company?: string;
}

export interface ActionItem {
  id: string;
  content: string;
  assignee?: string;
  dueDate?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface ClientFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

export interface Client {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  contacts?: Attendee[];
  meetings?: Meeting[];
  files?: ClientFile[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  description?: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsightItem {
  id: string;
  type: 'client_need' | 'project_scope' | 'risk' | 'opportunity' | 'follow_up';
  content: string;
  confidence: number;
  relatedActionItems?: string[];
}

export type MeetingStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'processing'
  | 'failed';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}