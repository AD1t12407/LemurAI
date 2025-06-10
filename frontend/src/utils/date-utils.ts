import { format, parseISO, isToday, isYesterday, isTomorrow } from 'date-fns';

/**
 * Format a date with a human-readable relative description
 */
export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

  if (isToday(date)) {
    return `Today`;
  } else if (isYesterday(date)) {
    return `Yesterday`;
  } else if (isTomorrow(date)) {
    return `Tomorrow`;
  } else {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
}

/**
 * Format a date with a human-readable relative description including time
 */
export function formatDateWithTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'EEE, MMM d • h:mm a');
  }
}

/**
 * Format time from Date object or string to 12h with AM/PM
 */
export function formatTime(timeInput: string | Date): string {
  if (typeof timeInput === 'string') {
    const [hours, minutes] = timeInput.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
  } else {
    return format(timeInput, 'h:mm a');
  }
}

/**
 * Get meeting duration in minutes
 */
export function getMeetingDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
}