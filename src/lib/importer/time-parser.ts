/**
 * Robust ISO 8601 Duration and Human Time String Parser
 */

export function parseIsoDurationToMinutes(durationStr: string | null | undefined): number {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  const str = durationStr.trim();
  if (!str) return 0;

  // 1. Standard ISO-8601 Duration (e.g. PT30M, PT1H, PT1H30M, P0DT0H45M)
  const isoMatch = str.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i
  );

  if (isoMatch) {
    const days = parseInt(isoMatch[1] || '0', 10);
    const hours = parseInt(isoMatch[2] || '0', 10);
    const minutes = parseInt(isoMatch[3] || '0', 10);
    const seconds = parseInt(isoMatch[4] || '0', 10);

    const total = days * 1440 + hours * 60 + minutes + Math.round(seconds / 60);
    if (total > 0) return total;
  }

  // 2. Fallback: Human strings like "1 hour 30 mins", "45 minutes", "1.5 hours", "25 m", "1 hr"
  let minutes = 0;

  // Check for hours: e.g. "1.5 hours", "2 hr", "1 hour"
  const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  if (hourMatch) {
    minutes += Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // Check for minutes: e.g. "30 mins", "45 minutes", "20 m"
  const minuteMatch = str.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i);
  if (minuteMatch) {
    minutes += parseInt(minuteMatch[1], 10);
  }

  // If simple integer provided (e.g. "30")
  if (minutes === 0) {
    const numeric = parseInt(str, 10);
    if (!isNaN(numeric) && numeric > 0 && numeric < 10000) {
      return numeric;
    }
  }

  return minutes;
}

/**
 * Intelligent Recipe Timing Sanitizer
 * Ensures active cooking time is distinguished from multi-day marination or erroneous numbers (e.g. 27 hrs 10 mins).
 */
export function sanitizeCookingTimes(
  rawPrep: number,
  rawCook: number,
  rawTotal: number
): { prepTimeMinutes: number; cookTimeMinutes: number; totalTimeMinutes: number } {
  let prep = Math.max(0, rawPrep || 0);
  let cook = Math.max(0, rawCook || 0);
  let total = Math.max(0, rawTotal || 0);

  // 1. If total is zero or missing, calculate from prep + cook
  if (total === 0 && (prep > 0 || cook > 0)) {
    total = prep + cook;
  }

  // 2. If prep + cook is realistic (< 300 mins) but total is huge (> 720 mins = 12+ hrs, e.g. overnight chilling / marinating)
  if (total > 720 && prep + cook > 0 && prep + cook <= 360) {
    total = prep + cook;
  }

  // 3. If prep or cook alone is huge (> 720 mins)
  if (prep > 720) prep = 15;
  if (cook > 720) cook = 30;

  // 4. Fallback defaults if all are 0
  if (prep === 0 && cook === 0 && total === 0) {
    prep = 15;
    cook = 25;
    total = 40;
  } else if (total === 0) {
    total = (prep || 15) + (cook || 20);
  } else if (prep === 0 && cook === 0 && total > 0 && total <= 360) {
    prep = Math.max(5, Math.round(total * 0.35));
    cook = total - prep;
  }

  // 5. Ensure total is at least prep + cook
  if (total < prep + cook) {
    total = prep + cook;
  }

  return { prepTimeMinutes: prep, cookTimeMinutes: cook, totalTimeMinutes: total };
}
