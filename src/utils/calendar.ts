// src/utils/calendar.ts
import type { FullTripItinerary } from '../types/travel';

/**
 * Parses natural language time strings (like "Morning", "2:30 PM", "15:00")
 * into precise hour and minute values.
 */
export function parseActivityTime(timeOfDay: string, fallbackHour: number = 9): { hour: number; minute: number } {
  const cleaned = timeOfDay.toLowerCase().trim();

  // 1. Match standard structures like "9:30 AM", "14:00", "3 PM"
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/;
  const match = cleaned.match(timeRegex);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3];

    if (ampm === 'pm' && hour < 12) {
      hour += 12;
    } else if (ampm === 'am' && hour === 12) {
      hour = 0;
    }

    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      return { hour, minute };
    }
  }

  // 2. Keyword fallback matching
  if (cleaned.includes('morning') || cleaned.includes('breakfast') || cleaned.includes('early')) {
    return { hour: 9, minute: 0 };
  } else if (cleaned.includes('lunch') || cleaned.includes('noon') || cleaned.includes('midday')) {
    return { hour: 12, minute: 0 };
  } else if (cleaned.includes('afternoon')) {
    return { hour: 14, minute: 0 };
  } else if (cleaned.includes('evening') || cleaned.includes('sunset') || cleaned.includes('tea')) {
    return { hour: 17, minute: 0 };
  } else if (cleaned.includes('dinner') || cleaned.includes('night') || cleaned.includes('late')) {
    return { hour: 20, minute: 0 };
  }

  return { hour: fallbackHour, minute: 0 };
}

/**
 * Parses duration strings (like "1.5 hours", "45 mins", "All day") into minutes.
 */
export function parseDurationInMinutes(durationStr: string): number {
  const cleaned = durationStr.toLowerCase().trim();

  // 1. Look for hourly counts: "1.5 hours", "2 hrs"
  const hourMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // 2. Look for minute counts: "45 minutes", "20 mins"
  const minMatch = cleaned.match(/(\d+)\s*(?:minute|min|m)/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  // 3. Keyword descriptions
  if (cleaned.includes('all day')) {
    return 8 * 60; // 8 hours
  } else if (cleaned.includes('half day')) {
    return 4 * 60; // 4 hours
  }

  return 120; // Default to 2 hours
}

/**
 * Formats a Date object to RFC 5545 UTC time format: YYYYMMDDTHHMMSSZ
 */
function formatIcsDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

/**
 * Escapes characters required by the iCalendar format specification.
 */
function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generates the .ics format string for a FullTripItinerary
 */
export function generateIcsFile(trip: FullTripItinerary, startDateStr: string): string {
  const baseDate = new Date(startDateStr);
  const stamp = formatIcsDateTime(new Date());
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Travel Guide//Itinerary Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  trip.itinerary.forEach((day) => {
    // Calculate the date for the current day
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + (day.dayNumber - 1));

    // Keep track of hours to stack successive events on the same day logically
    let currentHourOffset = 9;

    day.activities.forEach((act, idx) => {
      // Find start hour and minute
      const { hour, minute } = parseActivityTime(act.timeOfDay, currentHourOffset);
      
      // Construct start Date
      const eventStart = new Date(dayDate);
      eventStart.setHours(hour, minute, 0, 0);

      // Calculate end Date based on duration
      const durationMin = parseDurationInMinutes(act.estimatedDuration);
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventStart.getMinutes() + durationMin);

      // Update currentHourOffset for the next activity if timeOfDay is not absolute
      currentHourOffset = Math.min(23, Math.max(currentHourOffset + 1, Math.ceil(eventEnd.getHours())));

      // Build event description
      let description = act.description;
      if (act.localTip) {
        description += `\n\n💡 Tip: ${act.localTip}`;
      }
      if (act.transitTimeToNextStop) {
        description += `\n\n🚗 Transit to next stop: ${act.transitTimeToNextStop}`;
      }

      // Snapped restaurants context
      if (act.nearbyRestaurants && act.nearbyRestaurants.length > 0) {
        description += `\n\n🍽️ Nearby Dining Suggestions:`;
        act.nearbyRestaurants.forEach((rest) => {
          description += `\n- ${rest.name} (${rest.cuisine} | Price: ${rest.priceRange}): ${rest.whySpecial}`;
        });
      }

      ics.push('BEGIN:VEVENT');
      ics.push(`UID:act_${trip.id || 'trip'}_d${day.dayNumber}_a${idx}_${eventStart.getTime()}@aitravelguide.com`);
      ics.push(`DTSTAMP:${stamp}`);
      ics.push(`DTSTART:${formatIcsDateTime(eventStart)}`);
      ics.push(`DTEND:${formatIcsDateTime(eventEnd)}`);
      ics.push(`SUMMARY:${escapeIcsText(act.activityName)} (Day ${day.dayNumber})`);
      ics.push(`DESCRIPTION:${escapeIcsText(description)}`);
      ics.push(`LOCATION:${escapeIcsText(trip.metadata.destination)}`);
      ics.push('END:VEVENT');
    });
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Triggers a browser file download of the generated ICS payload
 */
export function triggerIcsDownload(tripName: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const filename = `${tripName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_itinerary.ics`;

  if ((navigator as any).msSaveBlob) { // IE10+
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
