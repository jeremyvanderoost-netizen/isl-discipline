export function getTodayRangeUTC(timeZone: string, now: Date = new Date()): { start: string; end: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }

  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10) - 1;
  const day = parseInt(map.day, 10);

  const asIfUTC = Date.UTC(year, month, day, hour, parseInt(map.minute, 10), parseInt(map.second, 10));
  const offsetMs = asIfUTC - now.getTime();

  const startOfDayAsIfUTC = Date.UTC(year, month, day, 0, 0, 0, 0);
  const endOfDayAsIfUTC = Date.UTC(year, month, day, 23, 59, 59, 999);

  return {
    start: new Date(startOfDayAsIfUTC - offsetMs).toISOString(),
    end: new Date(endOfDayAsIfUTC - offsetMs).toISOString()
  };
}
