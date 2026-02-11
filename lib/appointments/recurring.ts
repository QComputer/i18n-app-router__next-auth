/**
 * Recurring Appointments Utility
 * 
 * Utilities for handling recurring appointments using iCal RRULE format.
 */

import { addDays, addWeeks, addMonths, addYears, format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

/**
 * RRULE frequency types
 */
export type RRuleFrequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

/**
 * RRULE interval types
 */
export type RRuleInterval = 1 | 2 | 3 | 4;

/**
 * Parsed RRULE structure
 */
export interface ParsedRRule {
  freq: RRuleFrequency;
  interval: number;
  count?: number;
  until?: Date;
  byweekday?: number[]; // 0 = Sunday, 6 = Saturday
}

/**
 * Parse RRULE string into structured object
 */
export function parseRRule(rrule: string): ParsedRRule | null {
  try {
    const parts = rrule.split(";");
    const result: Partial<ParsedRRule> = {};

    for (const part of parts) {
      const [key, value] = part.split("=");
      
      switch (key) {
        case "FREQ":
          result.freq = value as RRuleFrequency;
          break;
        case "INTERVAL":
          result.interval = parseInt(value, 10) as RRuleInterval;
          break;
        case "COUNT":
          result.count = parseInt(value, 10);
          break;
        case "UNTIL":
          result.until = new Date(value.replace("T", " ").replace("Z", ""));
          break;
        case "BYDAY":
          result.byweekday = value.split(",").map((day) => {
            const dayMap: Record<string, number> = {
              SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
            };
            return dayMap[day] ?? 0;
          });
          break;
      }
    }

    return result as ParsedRRule;
  } catch {
    return null;
  }
}

/**
 * Generate RRULE string from parameters
 */
export function generateRRule(options: {
  frequency: RRuleFrequency;
  interval?: number;
  count?: number;
  until?: Date;
  weekdays?: number[];
}): string {
  const parts: string[] = [];

  parts.push(`FREQ=${options.frequency}`);

  if (options.interval && options.interval > 1) {
    parts.push(`INTERVAL=${options.interval}`);
  }

  if (options.count) {
    parts.push(`COUNT=${options.count}`);
  }

  if (options.until) {
    const dateStr = format(options.until, "yyyyMMdd'T'HHmmss'Z'");
    parts.push(`UNTIL=${dateStr}`);
  }

  if (options.weekdays && options.weekdays.length > 0) {
    const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const days = options.weekdays.map((d) => dayMap[d]).join(",");
    parts.push(`BYDAY=${days}`);
  }

  return parts.join(";");
}

/**
 * Generate occurrence dates from RRULE
 */
export function generateOccurrences(
  startDate: Date,
  rrule: string,
  options: {
    maxCount?: number;
    maxDate?: Date;
  } = {}
): Date[] {
  const parsed = parseRRule(rrule);
  if (!parsed) return [];

  const occurrences: Date[] = [];
  const { maxCount = 52, maxDate } = options;

  let currentDate = startOfDay(startDate);
  const end = maxDate ? endOfDay(maxDate) : null;
  let count = 0;

  while (count < maxCount) {
    // Check if we should include this date
    if (!end || isBefore(currentDate, end)) {
      // For weekly/biweekly, check weekday
      if (parsed.freq === "WEEKLY" || parsed.freq === "BIWEEKLY") {
        const dayOfWeek = currentDate.getDay();
        if (parsed.byweekday?.includes(dayOfWeek)) {
          occurrences.push(new Date(currentDate));
          count++;
        }
      } else if (parsed.freq === "MONTHLY") {
        // Simple monthly - same day of month
        if (currentDate.getDate() === startDate.getDate()) {
          occurrences.push(new Date(currentDate));
          count++;
        }
      } else if (parsed.freq === "YEARLY") {
        // Same date each year
        if (
          currentDate.getDate() === startDate.getDate() &&
          currentDate.getMonth() === startDate.getMonth()
        ) {
          occurrences.push(new Date(currentDate));
          count++;
        }
      } else {
        // Daily
        occurrences.push(new Date(currentDate));
        count++;
      }
    }

    // Move to next occurrence
    switch (parsed.freq) {
      case "DAILY":
        currentDate = addDays(currentDate, parsed.interval);
        break;
      case "WEEKLY":
        currentDate = addWeeks(currentDate, parsed.interval);
        break;
      case "BIWEEKLY":
        currentDate = addWeeks(currentDate, 2);
        break;
      case "MONTHLY":
        currentDate = addMonths(currentDate, parsed.interval);
        break;
      case "YEARLY":
        currentDate = addYears(currentDate, parsed.interval);
        break;
    }

    // Stop if we've gone too far
    if (end && isAfter(currentDate, end)) break;
    if (count >= maxCount) break;
  }

  return occurrences;
}

/**
 * Create recurring appointment series
 */
export async function createRecurringSeries(
  baseAppointment: {
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
  },
  rrule: string,
  options: {
    organizationId: string;
    serviceId: string;
    clientId?: string;
    staffId?: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    notes?: string;
    maxOccurrences?: number;
  }
): Promise<Array<{
  startTime: Date;
  endTime: Date;
}>> {
  const { duration } = baseAppointment;
  const maxOccurrences = options.maxOccurrences || 12; // Default to 12 occurrences

  // Parse the RRULE and generate occurrences
  const occurrences = generateOccurrences(baseAppointment.startTime, rrule, {
    maxCount: maxOccurrences,
  });

  // Create appointment objects with correct end times
  return occurrences.map((startTime) => ({
    startTime,
    endTime: new Date(startTime.getTime() + duration * 60000),
  }));
}

/**
 * Check if appointment time conflicts with recurring series
 */
export function checkRecurringConflict(
  checkDate: Date,
  baseAppointment: {
    startTime: Date;
    duration: number;
  },
  rrule: string
): boolean {
  const checkStart = startOfDay(checkDate);
  const checkEnd = endOfDay(checkDate);

  // Generate occurrences for the check date's week/month
  const occurrences = generateOccurrences(baseAppointment.startTime, rrule, {
    maxDate: checkEnd,
  });

  // Check if any occurrence falls on the check date
  return occurrences.some((occurrence) => {
    const occStart = startOfDay(occurrence);
    return occStart.getTime() === checkStart.getTime();
  });
}

/**
 * Format RRULE for display
 */
export function formatRRuleForDisplay(rrule: string, locale = "en"): string {
  const parsed = parseRRule(rrule);
  if (!parsed) return rrule;

  const frequencyLabels: Record<RRuleFrequency, string> = {
    DAILY: locale === "fa" ? "روزانه" : "Daily",
    WEEKLY: locale === "fa" ? "هفتگی" : "Weekly",
    BIWEEKLY: locale === "fa" ? "دو هفته یکبار" : "Every 2 weeks",
    MONTHLY: locale === "fa" ? "ماهانه" : "Monthly",
    YEARLY: locale === "fa" ? "سالانه" : "Yearly",
  };

  let label = frequencyLabels[parsed.freq] || parsed.freq;

  if (parsed.interval > 1) {
    label += ` (${locale === "fa" ? `هر ${parsed.interval} هفته` : `Every ${parsed.interval} weeks`})`;
  }

  if (parsed.count) {
    label += `, ${locale === "fa" ? `${parsed.count} جلسه` : `${parsed.count} times`}`;
  }

  if (parsed.until) {
    const dateStr = format(parsed.until, "PPP");
    label += `, ${locale === "fa" ? `تا ${dateStr}` : `until ${dateStr}`}`;
  }

  if (parsed.byweekday && parsed.freq === "WEEKLY") {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = parsed.byweekday.map((d) => dayLabels[d]).join(", ");
    label += `, ${locale === "fa" ? `روزهای ${days}` : `on ${days}`}`;
  }

  return label;
}

/**
 * Common recurrence presets
 */
export const recurrencePresets = [
  {
    label: "Once",
    rrule: null,
  },
  {
    label: "Weekly",
    rrule: generateRRule({ frequency: "WEEKLY" }),
  },
  {
    label: "Every 2 weeks",
    rrule: generateRRule({ frequency: "BIWEEKLY" }),
  },
  {
    label: "Monthly",
    rrule: generateRRule({ frequency: "MONTHLY" }),
  },
  {
    label: "3 times",
    rrule: generateRRule({ frequency: "WEEKLY", count: 3 }),
  },
  {
    label: "6 times",
    rrule: generateRRule({ frequency: "WEEKLY", count: 6 }),
  },
  {
    label: "12 times",
    rrule: generateRRule({ frequency: "WEEKLY", count: 12 }),
  },
];
