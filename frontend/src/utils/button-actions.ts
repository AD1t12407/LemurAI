import { Meeting, ActionItem, Company } from '../types';
import { useToastStore } from '../stores/toastStore';

// Get toast functions (to be used in components)
const getToast = () => useToastStore.getState();

// Meeting-related actions
export const scheduleMeeting = (openModal?: () => void) => {
  console.log('Opening meeting scheduler...');
  if (openModal) {
    openModal();
  } else {
    getToast().info('Meeting Scheduler', 'Opening meeting scheduler form...');
  }
};

export const viewAllMeetings = () => {
  console.log('Viewing all meetings...');
  getToast().info('Meetings', 'Loading all meetings...');
  // TODO: Navigate to meetings list page or show expanded view
};

export const joinMeeting = (meetingId: string) => {
  console.log(`Joining meeting ${meetingId}...`);
  getToast().success('Joining Meeting', `Opening meeting platform for meeting ${meetingId}...`);
  // TODO: Open meeting platform (Zoom, Teams, etc.)
  // Simulate opening external platform
  setTimeout(() => {
    getToast().info('Meeting Platform', 'Meeting platform should now be opening in a new window.');
  }, 1000);
};

// Meeting details actions
export const sendFollowUp = (meeting: Meeting) => {
  console.log('Sending follow-up email for meeting:', meeting.title);
  getToast().info('Generating Follow-up', `Creating follow-up email for "${meeting.title}"...`);

  // Simulate email generation
  setTimeout(() => {
    getToast().success('Follow-up Sent', `Follow-up email for "${meeting.title}" has been generated and sent with meeting summary and action items.`);
  }, 2000);
};

export const exportMeeting = (meeting: Meeting, format: 'pdf' | 'docx' | 'txt' = 'pdf') => {
  console.log(`Exporting meeting "${meeting.title}" as ${format.toUpperCase()}...`);
  getToast().info('Exporting Meeting', `Preparing ${format.toUpperCase()} export for "${meeting.title}"...`);

  // Simulate export process
  setTimeout(() => {
    getToast().success('Export Complete', `Meeting "${meeting.title}" has been exported as ${format.toUpperCase()} with summary, transcript, and action items.`);
  }, 1500);
};

export const shareMeeting = (meeting: Meeting) => {
  console.log('Sharing meeting:', meeting.title);
  getToast().info('Share Meeting', `Opening sharing options for "${meeting.title}"...`);
  // TODO: Open sharing modal
};

export const copyToClipboard = async (text: string, type: string = 'content') => {
  try {
    await navigator.clipboard.writeText(text);
    console.log(`${type} copied to clipboard`);
    getToast().success('Copied!', `${type} has been copied to your clipboard.`);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    getToast().error('Copy Failed', 'Failed to copy to clipboard. Please try again.');
  }
};

export const downloadTranscript = (meeting: Meeting) => {
  console.log(`Downloading transcript for meeting: ${meeting.title}`);
  getToast().info('Downloading', `Preparing transcript download for "${meeting.title}"...`);

  // Simulate download
  setTimeout(() => {
    getToast().success('Download Ready', `Transcript for "${meeting.title}" is ready for download.`);
  }, 1000);
};

// Action item actions
export const addActionItem = (meetingId: string) => {
  console.log(`Adding action item to meeting ${meetingId}...`);
  alert('This would open a form to add a new action item to the meeting.');
};

export const toggleActionItem = (actionItem: ActionItem) => {
  const newStatus = actionItem.status === 'completed' ? 'pending' : 'completed';
  console.log(`Toggling action item ${actionItem.id} to ${newStatus}`);
  alert(`Action item "${actionItem.content}" marked as ${newStatus}.`);
  // TODO: Update action item status in state/database
};

export const editActionItem = (actionItem: ActionItem) => {
  console.log(`Editing action item ${actionItem.id}...`);
  alert(`This would open an edit form for action item: "${actionItem.content}"`);
};

// Settings actions
export const changeAvatar = () => {
  console.log('Opening avatar change dialog...');
  alert('This would open a file picker to upload a new avatar image.');
};

export const saveProfile = (name: string, email: string) => {
  console.log('Saving profile changes...', { name, email });
  alert(`Profile updated successfully!\nName: ${name}\nEmail: ${email}`);
  // TODO: Update user profile in state/database
};

export const saveNotificationSettings = (settings: {
  emailNotifications: boolean;
  summaryEmails: boolean;
  actionItemReminders: boolean;
}) => {
  console.log('Saving notification settings...', settings);
  alert('Notification settings saved successfully!');
  // TODO: Update notification preferences in state/database
};

export const saveCompanyDetails = (companyData: Partial<Company>) => {
  console.log('Saving company details...', companyData);
  getToast().info('Saving Company Details', 'Updating your company information...');

  // Simulate API call
  setTimeout(() => {
    getToast().success('Company Details Saved', 'Your company information has been updated successfully!');
  }, 1500);

  // TODO: Update company details in state/database
};

export const connectIntegration = (service: string) => {
  console.log(`Connecting to ${service}...`);
  alert(`This would initiate OAuth flow to connect your ${service} account.`);
  // TODO: Implement OAuth integration
};

export const updatePassword = (currentPassword: string, newPassword: string) => {
  console.log('Updating password...');
  if (!currentPassword || !newPassword) {
    alert('Please fill in all password fields.');
    return;
  }
  if (newPassword.length < 8) {
    alert('New password must be at least 8 characters long.');
    return;
  }
  alert('Password updated successfully!');
  // TODO: Update password in backend
};

export const deleteAccount = () => {
  const confirmed = confirm(
    'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
  );
  if (confirmed) {
    console.log('Deleting account...');
    alert('Account deletion initiated. You will receive a confirmation email.');
    // TODO: Implement account deletion
  }
};

// Navigation actions
export const navigateToSettings = () => {
  window.location.href = '/settings';
};

export const navigateToDashboard = () => {
  window.location.href = '/dashboard';
};

export const navigateToMeetings = () => {
  window.location.href = '/dashboard'; // Currently redirects to dashboard
};

// Demo/trial actions
export const startFreeTrial = () => {
  console.log('Starting free trial...');
  alert('This would start a free trial and redirect to the signup process.');
  window.location.href = '/signup';
};

export const scheduleDemo = () => {
  console.log('Scheduling demo...');
  alert('This would open a calendar booking widget to schedule a demo call.');
};

// Utility functions
export const showNotImplemented = (feature: string) => {
  alert(`${feature} is not yet implemented. This is a demo version.`);
};

export const confirmAction = (message: string, callback: () => void) => {
  if (confirm(message)) {
    callback();
  }
};
