import { describe, expect, it } from 'vitest';
import {
  lineHeight,
  LINE_HEIGHT,
  needsFullResolution,
  setTextStyle,
  TEXT_COLORS,
  TEXT_STYLE_INFO,
  TEXT_STYLES,
  textStyle,
} from '../src/engine/font';
import { DEFAULT_SETTINGS, loadSettings } from '../src/game/settings';

describe('text styles', () => {
  it('Crisp is the default, including for settings saved before styles existed', () => {
    expect(DEFAULT_SETTINGS.textStyle).toBe('crisp');
    expect(loadSettings({ getItem: () => JSON.stringify({ music: 0.3 }) }).textStyle).toBe('crisp');
    // a style someone chose is kept
    expect(loadSettings({ getItem: () => JSON.stringify({ textStyle: 'classic' }) }).textStyle).toBe(
      'classic',
    );
  });

  it('every style is described, and only the finer ones need full resolution', () => {
    for (const s of TEXT_STYLES) expect(TEXT_STYLE_INFO[s].label).toBeTruthy();
    expect(needsFullResolution('classic')).toBe(false);
    expect(needsFullResolution('contrast')).toBe(false);
    expect(needsFullResolution('crisp')).toBe(true);
    expect(needsFullResolution('clean')).toBe(true);
  });

  it('finer styles pack lines closer together; Classic keeps its spacing', () => {
    setTextStyle('classic', 1);
    expect(lineHeight()).toBe(LINE_HEIGHT);
    setTextStyle('crisp', 4);
    expect(lineHeight()).toBeLessThan(LINE_HEIGHT);
    // whole device pixels
    expect((lineHeight() * 4) % 1).toBe(0);
    setTextStyle('clean', 3);
    expect(lineHeight()).toBeLessThan(LINE_HEIGHT);
    setTextStyle('classic', 1);
  });

  it('High Contrast brightens secondary text, and switching back restores it', () => {
    setTextStyle('classic', 1);
    const gray = TEXT_COLORS.gray;
    setTextStyle('contrast', 1);
    expect(TEXT_COLORS.gray).not.toBe(gray);
    setTextStyle('classic', 1);
    expect(TEXT_COLORS.gray).toBe(gray);
    // an unknown style falls back to Classic
    setTextStyle('bogus' as never, 1);
    expect(textStyle()).toBe('classic');
  });
});
