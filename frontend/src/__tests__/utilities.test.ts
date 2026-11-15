import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '../utils/time';

describe('Member 4 QA: Utilities & Formatting Test Suite', () => {
  it('TC-TIME-001: should return "just now" for timestamps less than 60 seconds ago', () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toBe('just now');
  });

  it('TC-TIME-002: should format minutes accurately', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m');
  });

  it('TC-TIME-003: should format hours accurately', () => {
    const fourHoursAgo = new Date(Date.now() - 4 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(fourHoursAgo)).toBe('4h');
  });

  it('TC-TAG-001: should extract valid hashtags and ignore numbers or bare hashes', () => {
    const input = 'Developing on #Redis and #TypeScript! Ignore #123 and #';
    const regex = /#(?!\d+\b)([a-zA-Z0-9_]{1,50})/g;
    const matches = Array.from(input.matchAll(regex)).map(m => m[1].toLowerCase());

    expect(matches).toEqual(['redis', 'typescript']);
    expect(matches).not.toContain('123');
  });

  it('TC-MENTION-001: should extract valid @mentions', () => {
    const input = 'Big shoutout to @sarah_tech and @alex_dev for the help';
    const regex = /@([a-zA-Z0-9_]{3,20})/g;
    const mentions = Array.from(input.matchAll(regex)).map(m => m[1]);

    expect(mentions).toEqual(['sarah_tech', 'alex_dev']);
  });
});
