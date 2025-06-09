import { Meeting } from '../types';

// Sample meeting data for the dashboard
export const upcomingMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Tech stand up',
    date: '2025-05-30',
    startTime: '08:00',
    endTime: '08:30',
    attendees: [
      {
        id: 'a1',
        name: 'Aman Sanghi',
        email: 'amansanghi@synatechsolutions.com',
      },
      {
        id: 'a2',
        name: 'Demo User',
        email: 'demo@lemurai.com',
      }
    ],
    status: 'scheduled',
    joinUrl: '#',
    platform: 'zoom',
    meetingType: 'internal'
  },
  {
    id: 'm2',
    title: 'Client Project Kickoff',
    date: '2025-05-30',
    startTime: '11:00',
    endTime: '12:00',
    attendees: [
      {
        id: 'a1',
        name: 'Aman Sanghi',
        email: 'amansanghi@synatechsolutions.com',
      },
      {
        id: 'a3',
        name: 'Aditi Sharma',
        email: 'aditi@synatechsolutions.com',
      },
      {
        id: 'a4',
        name: 'John Client',
        email: 'john@client.com',
        company: 'Client Co',
        role: 'Project Manager'
      },
      {
        id: 'a2',
        name: 'Demo User',
        email: 'demo@lemurai.com',
      }
    ],
    status: 'scheduled',
    joinUrl: '#',
    platform: 'teams',
    meetingType: 'external'
  },
  {
    id: 'm3',
    title: 'Weekly Team Sync',
    date: '2025-05-31',
    startTime: '10:00',
    endTime: '10:30',
    attendees: [
      {
        id: 'a1',
        name: 'Aman Sanghi',
        email: 'amansanghi@synatechsolutions.com',
      },
      {
        id: 'a3',
        name: 'Aditi Sharma',
        email: 'aditi@synatechsolutions.com',
      },
      {
        id: 'a5',
        name: 'Rahul Dev',
        email: 'rahul@synatechsolutions.com',
      },
      {
        id: 'a2',
        name: 'Demo User',
        email: 'demo@lemurai.com',
      }
    ],
    status: 'scheduled',
    joinUrl: '#',
    platform: 'meet',
    meetingType: 'internal'
  },
];

export const recentMeetings: Meeting[] = [
  {
    id: 'm4',
    title: 'Tech stand up',
    date: '2025-05-29',
    startTime: '08:00',
    endTime: '08:30',
    attendees: [
      {
        id: 'a1',
        name: 'Aman Sanghi',
        email: 'amansanghi@synatechsolutions.com',
      },
      {
        id: 'a2',
        name: 'Demo User',
        email: 'demo@lemurai.com',
      }
    ],
    status: 'completed',
    summary: 'The team discussed API integration, client privacy concerns, and backend development progress. Action items were assigned for the summary feature and MVP deployment.',
    actionItems: [
      {
        id: 'ai1',
        content: 'Review API integration approach',
        assignee: 'Demo User',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'ai2',
        content: 'Prepare client privacy documentation',
        assignee: 'Aman Sanghi',
        dueDate: '2025-06-01',
        status: 'pending',
        priority: 'medium'
      }
    ],
    platform: 'zoom',
    meetingType: 'internal'
  },
  {
    id: 'm5',
    title: 'aditi@synatechsolutions.com - Untitled',
    date: '2025-05-28',
    startTime: '09:35',
    endTime: '10:30',
    attendees: [
      {
        id: 'a3',
        name: 'Aditi Sharma',
        email: 'aditi@synatechsolutions.com',
      },
      {
        id: 'a2',
        name: 'Demo User',
        email: 'demo@lemurai.com',
      }
    ],
    status: 'completed',
    summary: 'Discussion focused on bot integration checks, data latency issues, and UI verification protocols. The team also addressed training needs for the verification process.',
    actionItems: [
      {
        id: 'ai3',
        content: 'Create UI verification protocol document',
        assignee: 'Demo User',
        dueDate: '2025-05-31',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'ai4',
        content: 'Schedule team training session',
        assignee: 'Aditi Sharma',
        dueDate: '2025-06-02',
        status: 'pending',
        priority: 'medium'
      }
    ],
    platform: 'teams',
    meetingType: 'internal'
  },
  {
    id: 'm6',
    title: 'Trial',
    date: '2025-05-28',
    startTime: '13:16',
    endTime: '14:00',
    attendees: [
      {
        id: 'a3',
        name: 'Aditi Sharma',
        email: 'aditi@synatechsolutions.com',
      },
      {
        id: 'a2',
        name: 'Demo User',
        email: 'demo@lemurai.com',
      }
    ],
    status: 'completed',
    summary: 'The trial meeting covered API integration for transcription, pricing analysis compared to competitors like Otter, and cost-saving strategies including student discounts.',
    actionItems: [
      {
        id: 'ai5',
        content: 'Compile competitor pricing analysis',
        assignee: 'Demo User',
        dueDate: '2025-06-03',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'ai6',
        content: 'Investigate third-party API options',
        assignee: 'Aditi Sharma',
        dueDate: '2025-05-31',
        status: 'completed',
        priority: 'high'
      }
    ],
    platform: 'zoom',
    meetingType: 'external'
  }
];

// Combine for all meetings
export const allMeetings = [...recentMeetings, ...upcomingMeetings];

// Get meeting by ID
export function getMeetingById(id: string): Meeting | undefined {
  return allMeetings.find(meeting => meeting.id === id);
}