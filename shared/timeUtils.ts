// Normalize time format to support both legacy and new formats
export function normalizeTimeSlot(time: string): string {
  // If already in new format (HH:mm-HH:mm or H:mm-H:mm), return as is
  if (time.includes('-') && !time.includes('AM') && !time.includes('PM')) {
    return time;
  }

  // Convert legacy format (e.g., "8:00 AM") to new format (e.g., "8:00-8:30")
  const timeMapping: Record<string, string> = {
    "8:00 AM": "8:00-8:30",
    "8:30 AM": "8:30-9:00",
    "9:00 AM": "9:00-9:30",
    "9:30 AM": "9:30-10:00",
    "10:00 AM": "10:00-10:30",
    "10:30 AM": "10:30-11:00",
    "11:00 AM": "11:00-11:30",
    "11:30 AM": "11:30-12:00",
    "12:00 PM": "12:00-12:30",
    "12:30 PM": "12:30-13:00",
    "1:00 PM": "13:00-13:30",
    "1:30 PM": "13:30-14:00",
    "2:00 PM": "14:00-14:30",
    "2:30 PM": "14:30-15:00",
    "3:00 PM": "15:00-15:30",
    "3:30 PM": "15:30-16:00",
    "4:00 PM": "16:00-16:30",
    "4:30 PM": "16:30-17:00",
    "5:00 PM": "17:00-17:30",
    "5:30 PM": "17:30-18:00",
    "6:00 PM": "18:00-18:30",
    "6:30 PM": "18:30-19:00",
    "7:00 PM": "19:00-19:30",
    "7:30 PM": "19:30-20:00"
  };

  return timeMapping[time] || time;
}
