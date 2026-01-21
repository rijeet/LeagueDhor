/**
 * Date utility functions for displaying dates
 * 
 * IMPORTANT: Backend sends dates in UTC (ISO format with 'Z' suffix).
 * Frontend converts these to the user's local browser timezone for display.
 */

/**
 * Normalizes a date string from the backend (UTC) to user's local timezone
 * @param dateString - Date string from backend (UTC format: "YYYY-MM-DDTHH:mm:ssZ" or ISO)
 */
export function normalizeDate(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }
  
  // Trim whitespace
  const trimmed = dateString.trim();
  
  // Check if it has timezone info
  const hasTimezone = trimmed.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(trimmed);
  
  if (!hasTimezone) {
    // No timezone - assume it's UTC and append 'Z'
    // This handles cases where backend might send dates without timezone
    const utcString = trimmed.includes('T') ? trimmed + 'Z' : trimmed + 'T00:00:00Z';
    return new Date(utcString);
  }
  
  // Has timezone - parse normally (JavaScript will convert to local timezone)
  return new Date(trimmed);
}

/**
 * Formats a date string to a localized date string (e.g., "January 15, 2025")
 */
export function formatDate(dateString: string): string {
  const date = normalizeDate(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date string to a localized time string (e.g., "9:01 PM")
 */
export function formatTime(dateString: string): string {
  const date = normalizeDate(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date string to a localized date and time string
 * (e.g., "January 15, 2025 at 9:01 PM")
 */
export function formatDateTime(dateString: string): string {
  const date = normalizeDate(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date string to a short date and time string
 * (e.g., "1/15/2025, 9:01 PM")
 */
export function formatShortDateTime(dateString: string): string {
  const date = normalizeDate(dateString);
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date string for "Last updated" display
 * (e.g., "9:01 PM" or "Jan 15, 9:01 PM" if not today)
 */
export function formatLastUpdated(dateString: string): string {
  const date = normalizeDate(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // If it's today, show only time
  if (dateOnly.getTime() === today.getTime()) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  
  // Otherwise, show date and time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a timestamp for crime cards (time only)
 */
export function formatTimestamp(dateString: string): string {
  return formatTime(dateString);
}

