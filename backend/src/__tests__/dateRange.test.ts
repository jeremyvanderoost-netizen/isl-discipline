import { describe, it, expect } from 'vitest';
import { getTodayRangeUTC } from '../utils/dateRange.js';

describe('getTodayRangeUTC', () => {
  it('calcule les bornes du jour en heure d\'été (CEST, UTC+2)', () => {
    const now = new Date('2026-07-15T10:00:00.000Z');
    const { start, end } = getTodayRangeUTC('Europe/Brussels', now);
    expect(start).toBe('2026-07-14T22:00:00.000Z');
    expect(end).toBe('2026-07-15T21:59:59.999Z');
  });

  it('calcule les bornes du jour en heure d\'hiver (CET, UTC+1)', () => {
    const now = new Date('2026-01-15T10:00:00.000Z');
    const { start, end } = getTodayRangeUTC('Europe/Brussels', now);
    expect(start).toBe('2026-01-14T23:00:00.000Z');
    expect(end).toBe('2026-01-15T22:59:59.999Z');
  });

  it('gère le passage de minuit local correctement', () => {
    // 2026-09-01T23:30:00Z = 2026-09-02T01:30 en heure de Bruxelles (CEST)
    const now = new Date('2026-09-01T23:30:00.000Z');
    const { start, end } = getTodayRangeUTC('Europe/Brussels', now);
    expect(start).toBe('2026-09-01T22:00:00.000Z');
    expect(end).toBe('2026-09-02T21:59:59.999Z');
  });
});
