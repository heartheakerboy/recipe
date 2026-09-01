export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 mins';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} mins`;
  }
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  }
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${remainingMinutes} mins`;
}

export function formatIsoDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return 'PT0M';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let iso = 'PT';
  if (hours > 0) iso += `${hours}H`;
  if (remainingMinutes > 0 || hours === 0) iso += `${remainingMinutes}M`;
  return iso;
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
