import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meeting, ActionItem } from '../types';
import { recentMeetings, upcomingMeetings } from '../data/meetings';

interface DataStore {
  meetings: Meeting[];
  actionItems: ActionItem[];
  
  // Meeting actions
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (meetingId: string) => void;
  getMeeting: (meetingId: string) => Meeting | undefined;
  
  // Action item actions
  addActionItem: (actionItem: ActionItem) => void;
  updateActionItem: (itemId: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (itemId: string) => void;
  toggleActionItemStatus: (itemId: string) => void;
  getActionItemsByMeeting: (meetingId: string) => ActionItem[];
  
  // Utility actions
  initializeData: () => void;
}

// Generate some sample action items for existing meetings
const generateSampleActionItems = (): ActionItem[] => {
  const allMeetings = [...recentMeetings, ...upcomingMeetings];
  const actionItems: ActionItem[] = [];
  
  allMeetings.forEach((meeting, meetingIndex) => {
    // Add 2-4 action items per meeting
    const itemCount = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < itemCount; i++) {
      const sampleTasks = [
        'Send follow-up email with meeting summary',
        'Prepare technical requirements document',
        'Schedule next review meeting',
        'Update project timeline',
        'Review and approve proposal draft',
        'Coordinate with development team',
        'Prepare client presentation',
        'Update CRM with meeting notes',
        'Research competitor solutions',
        'Draft scope of work document',
      ];
      
      const sampleAssignees = [
        'John Smith',
        'Sarah Johnson',
        'Mike Chen',
        'Emily Davis',
        'Alex Rodriguez',
        'Lisa Wang',
      ];
      
      const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const statuses: ('pending' | 'completed')[] = ['pending', 'completed'];
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) + 1);
      
      actionItems.push({
        id: `${meeting.id}-action-${i}`,
        content: sampleTasks[Math.floor(Math.random() * sampleTasks.length)],
        assignee: Math.random() > 0.3 ? sampleAssignees[Math.floor(Math.random() * sampleAssignees.length)] : undefined,
        dueDate: Math.random() > 0.4 ? dueDate.toISOString().split('T')[0] : undefined,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: Math.random() > 0.7 ? 'completed' : 'pending',
        meetingId: meeting.id,
      });
    }
  });
  
  return actionItems;
};

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      meetings: [],
      actionItems: [],

      // Meeting actions
      addMeeting: (meeting) => {
        set((state) => ({
          meetings: [...state.meetings, meeting],
        }));
      },

      updateMeeting: (meetingId, updates) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId ? { ...meeting, ...updates } : meeting
          ),
        }));
      },

      deleteMeeting: (meetingId) => {
        set((state) => ({
          meetings: state.meetings.filter((meeting) => meeting.id !== meetingId),
          actionItems: state.actionItems.filter((item) => item.meetingId !== meetingId),
        }));
      },

      getMeeting: (meetingId) => {
        const state = get();
        return state.meetings.find((meeting) => meeting.id === meetingId);
      },

      // Action item actions
      addActionItem: (actionItem) => {
        set((state) => ({
          actionItems: [...state.actionItems, actionItem],
        }));
      },

      updateActionItem: (itemId, updates) => {
        set((state) => ({
          actionItems: state.actionItems.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      },

      deleteActionItem: (itemId) => {
        set((state) => ({
          actionItems: state.actionItems.filter((item) => item.id !== itemId),
        }));
      },

      toggleActionItemStatus: (itemId) => {
        set((state) => ({
          actionItems: state.actionItems.map((item) =>
            item.id === itemId
              ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
              : item
          ),
        }));
      },

      getActionItemsByMeeting: (meetingId) => {
        const state = get();
        return state.actionItems.filter((item) => item.meetingId === meetingId);
      },

      // Initialize data
      initializeData: () => {
        const state = get();
        if (state.meetings.length === 0) {
          // Initialize with sample data
          const allMeetings = [...recentMeetings, ...upcomingMeetings];
          const sampleActionItems = generateSampleActionItems();
          
          set({
            meetings: allMeetings,
            actionItems: sampleActionItems,
          });
        }
      },
    }),
    {
      name: 'lemur-data-store',
      version: 1,
    }
  )
);
