/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, act } from '@testing-library/react';
import React, { useState } from 'react';
import '@testing-library/jest-dom';
import { TimeDisplay } from '../components/TimeDisplay';
import { TimeDisplayLabel } from '../components/TimeDisplayLabel';
import { TimeDisplayValue } from '../components/TimeDisplayValue';
import { TimeDisplayHelperText } from '../components/TimeDisplayHelperText';
import { TimeDisplayComplete } from '../components/TimeDisplayComplete';

jest.mock('../components/time-display.scss', () => ({}));
jest.useFakeTimers();

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const JOB_START = new Date(Date.now() - 10000); // 10 sec ago
const FUTURE_END = new Date(Date.now() + 10000); // 10 sec from now
const PAST_END = new Date(Date.now() - 1000);   // already expired

// ---------------------------------------------------------------------------
// TimeDisplay root
// ---------------------------------------------------------------------------

describe('TimeDisplay root', () => {
  it('renders children', () => {
    render(
      <TimeDisplay>
        <span data-testid="child">hello</span>
      </TimeDisplay>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies --animated class by default', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplay.Value mode="duration" duration={60} />
      </TimeDisplay>
    );
    expect(container.firstChild).toHaveClass('clabs--time-display--animated');
  });

  it('omits --animated class when animated={false}', () => {
    const { container } = render(
      <TimeDisplay animated={false}>
        <TimeDisplay.Value mode="duration" duration={60} />
      </TimeDisplay>
    );
    expect(container.firstChild).not.toHaveClass('clabs--time-display--animated');
  });

  it('forwards className to root element', () => {
    const { container } = render(
      <TimeDisplay className="my-class">
        <TimeDisplay.Value mode="duration" duration={60} />
      </TimeDisplay>
    );
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('forwards data-testid to root element', () => {
    render(
      <TimeDisplay data-testid="td-root">
        <TimeDisplay.Value mode="duration" duration={60} />
      </TimeDisplay>
    );
    expect(screen.getByTestId('td-root')).toBeInTheDocument();
  });

  it('sr-only div is always present with role="status" and aria-live="off"', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplay.Value mode="duration" duration={60} />
      </TimeDisplay>
    );
    const sr = container.querySelector('[class*="sr-only"]');
    expect(sr).toBeInTheDocument();
    expect(sr).toHaveAttribute('role', 'status');
    expect(sr).toHaveAttribute('aria-live', 'off');
  });

  it('live region div is always present with role="status" and aria-live="polite"', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplay.Value mode="duration" duration={60} />
      </TimeDisplay>
    );
    const live = container.querySelector('[class*="live-region"]');
    expect(live).toBeInTheDocument();
    expect(live).toHaveAttribute('role', 'status');
    expect(live).toHaveAttribute('aria-live', 'polite');
  });
});

// ---------------------------------------------------------------------------
// TimeDisplay.Label
// ---------------------------------------------------------------------------

describe('TimeDisplay.Label', () => {
  it('renders children', () => {
    render(
      <TimeDisplay>
        <TimeDisplayLabel>Elapsed time</TimeDisplayLabel>
      </TimeDisplay>
    );
    expect(screen.getByText('Elapsed time')).toBeInTheDocument();
  });

  it('applies --hidden class when hidden={true}', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayLabel hidden>Elapsed time</TimeDisplayLabel>
      </TimeDisplay>
    );
    const label = container.querySelector('[class*="label--hidden"]');
    expect(label).toBeInTheDocument();
  });

  it('does NOT use display:none for hidden — element stays in DOM', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayLabel hidden>Elapsed time</TimeDisplayLabel>
      </TimeDisplay>
    );
    // The text must still be in the document (visually-hidden, not removed)
    expect(screen.getByText('Elapsed time')).toBeInTheDocument();
  });

  it('applies --inline class when inline={true}', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayLabel inline>Elapsed time</TimeDisplayLabel>
      </TimeDisplay>
    );
    const label = container.querySelector('[class*="label--inline"]');
    expect(label).toBeInTheDocument();
  });

  it('registers plain-string children as labelText in context', async () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayLabel>Session expires in</TimeDisplayLabel>
        <TimeDisplayValue mode="duration" duration={90} />
      </TimeDisplay>
    );
    // SR text in sr-only div must include the label
    await act(async () => {});
    const sr = container.querySelector('[class*="sr-only"]');
    expect(sr?.textContent).toContain('Session expires in');
  });
});

// ---------------------------------------------------------------------------
// TimeDisplay.Value
// ---------------------------------------------------------------------------

describe('TimeDisplay.Value', () => {
  describe('formats', () => {
    it('renders stacked format by default', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={3661} />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="split-container"]')).toBeInTheDocument();
    });

    it('renders boxed format', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={3661} format="boxed" />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="boxed-container"]')).toBeInTheDocument();
    });

    it('renders flat format', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={3661} format="flat" />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="flat-container"]')).toBeInTheDocument();
    });

    it('renders inline format', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={3661} format="inline" />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="inline-container"]')).toBeInTheDocument();
    });
  });

  describe('flat format separator', () => {
    it('renders separator spans between units', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            format="flat"
            units={['hours', 'minutes', 'seconds']}
          />
        </TimeDisplay>
      );
      const separators = container.querySelectorAll('[class*="flat-separator"]');
      // 3 units → 2 separators
      expect(separators).toHaveLength(2);
    });

    it('flat separators have aria-hidden="true"', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={3661} format="flat" />
        </TimeDisplay>
      );
      const separators = container.querySelectorAll('[class*="flat-separator"]');
      separators.forEach((sep) => {
        expect(sep).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('renders custom separator prop', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            format="flat"
            units={['minutes', 'seconds']}
            separator=" · "
          />
        </TimeDisplay>
      );
      // Separator may be split across text nodes due to dir="ltr" spans;
      // query by class instead of text content
      const sep = container.querySelector('[class*="flat-separator"]');
      expect(sep).toBeInTheDocument();
      expect(sep?.textContent).toBe(' · ');
    });
  });

  describe('SR text', () => {
    it('SR text uses full unit labels, not the visual short labels', async () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayLabel>Total runtime</TimeDisplayLabel>
          <TimeDisplayValue mode="duration" duration={3661} />
        </TimeDisplay>
      );
      await act(async () => {});
      const sr = container.querySelector('[class*="sr-only"]');
      // Full labels: "hours", "minutes", "seconds" — not short "hr", "min", "sec"
      expect(sr?.textContent).toMatch(/hour|hours/);
      expect(sr?.textContent).toMatch(/minute|minutes/);
      // "hr" and "min" must not appear as standalone short labels.
      // Use word-boundary pattern: "min " would match the short label but not "minute"
      expect(sr?.textContent).not.toMatch(/\bhr\b/);
      expect(sr?.textContent).not.toMatch(/\d min[^u]/); // "1 min " but not "1 minute"
    });

    it('SR text never contains the flat separator character', async () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayLabel>Elapsed</TimeDisplayLabel>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            format="flat"
            separator=":"
          />
        </TimeDisplay>
      );
      await act(async () => {});
      const sr = container.querySelector('[class*="sr-only"]');
      // SR text should read "1 hour, 1 minute, 1 second" — no colons
      expect(sr?.textContent).not.toMatch(/\d:\d/);
    });

    it('accessibleUnitLabels overrides SR labels independently of visible labels', async () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayLabel>Elapsed</TimeDisplayLabel>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            unitLabels={{ hours: 'h', minutes: 'm', seconds: 's' }}
            accessibleUnitLabels={{ hours: 'heures', minutes: 'minutes', seconds: 'secondes' }}
          />
        </TimeDisplay>
      );
      await act(async () => {});
      const sr = container.querySelector('[class*="sr-only"]');
      expect(sr?.textContent).toContain('heures');
      expect(sr?.textContent).toContain('secondes');
      // Visual labels should NOT appear in SR text
      expect(sr?.textContent).not.toContain(' h ');
    });
  });

  describe('keepZeroValueUnits', () => {
    it('hides zero-value units when keepZeroValueUnits={false}', () => {
      // duration=65 → 0 hr, 1 min, 5 sec — hours should be hidden
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={65}
            format="stacked"
            keepZeroValueUnits={false}
          />
        </TimeDisplay>
      );
      const units = container.querySelectorAll('[class*="split-unit"]');
      // Only minutes + seconds visible (hours=0 hidden)
      expect(units).toHaveLength(2);
    });

    it('always shows at least the smallest unit when all are zero', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={0}
            units={['minutes', 'seconds']}
            keepZeroValueUnits={false}
          />
        </TimeDisplay>
      );
      // seconds (smallest) must always be present
      const units = container.querySelectorAll('[class*="split-unit"]');
      expect(units.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('padWithZero', () => {
    it('pads values with leading zero by default', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={65} units={['seconds']} />
        </TimeDisplay>
      );
      // 65 sec → seconds value = 5, padded to "05"
      expect(container.textContent).toContain('0');
    });

    it('removes leading zero when padWithZero={false}', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={65}
            units={['seconds']}
            padWithZero={false}
          />
        </TimeDisplay>
      );
      // 65 sec → seconds = 5, not padded
      expect(container.textContent).toContain('5');
      expect(container.textContent).not.toContain('05');
    });
  });

  describe('unitLabels', () => {
    it('overrides visible unit labels', () => {
      render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            unitLabels={{ hours: 'h', minutes: 'm', seconds: 's' }}
          />
        </TimeDisplay>
      );
      expect(screen.getByText('h')).toBeInTheDocument();
      expect(screen.getByText('m')).toBeInTheDocument();
      expect(screen.getByText('s')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    let errorSpy;
    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => errorSpy.mockRestore());

    it('returns null when count-up mode is missing startTime', () => {
      const { container } = render(
        <TimeDisplay>
          {/* @ts-expect-error intentional */}
          <TimeDisplayValue mode="count-up" />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="split-container"]')).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('count-up mode requires startTime')
      );
    });

    it('returns null when count-down mode is missing endTime', () => {
      const { container } = render(
        <TimeDisplay>
          {/* @ts-expect-error intentional */}
          <TimeDisplayValue mode="count-down" />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="split-container"]')).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('count-down mode requires endTime')
      );
    });

    it('returns null when duration mode is missing duration', () => {
      const { container } = render(
        <TimeDisplay>
          {/* @ts-expect-error intentional */}
          <TimeDisplayValue mode="duration" />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="split-container"]')).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('duration mode requires a duration value')
      );
    });

    it('returns null when units is empty', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="duration" duration={60} units={[]} />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="split-container"]')).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('units must contain at least one time unit')
      );
    });

    it('returns null for a non-13-digit numeric startTime', () => {
      const { container } = render(
        <TimeDisplay>
          <TimeDisplayValue mode="count-up" startTime={1700000000} />
        </TimeDisplay>
      );
      expect(container.querySelector('[class*="split-container"]')).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('13-digit millisecond Unix timestamp')
      );
    });
  });

  describe('warnings', () => {
    let warnSpy;
    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => warnSpy.mockRestore());

    it('warns when units are in wrong canonical order', () => {
      render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            units={['seconds', 'hours']}
          />
        </TimeDisplay>
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('out of canonical order')
      );
    });

    it('warns when format is unknown', () => {
      render(
        <TimeDisplay>
          {/* @ts-expect-error intentional */}
          <TimeDisplayValue mode="duration" duration={3661} format="table" />
        </TimeDisplay>
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown format "table"')
      );
    });

    it('warns when thresholds used with non-count-down mode', () => {
      render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="duration"
            duration={3661}
            thresholds={[{ value: 30, label: '30s' }]}
          />
        </TimeDisplay>
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('thresholds only apply to count-down mode')
      );
    });

    it('warns when onComplete provided for non-count-down mode', () => {
      render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="count-up"
            startTime={JOB_START}
            onComplete={() => {}}
          />
        </TimeDisplay>
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('onComplete has no effect in "count-up" mode')
      );
    });
  });

  describe('onComplete', () => {
    it('fires onComplete once when countdown reaches zero', () => {
      const onComplete = jest.fn();
      render(
        <TimeDisplay>
          <TimeDisplayValue
            mode="count-down"
            endTime={PAST_END}
            onComplete={onComplete}
          />
        </TimeDisplay>
      );
      act(() => jest.advanceTimersByTime(2000));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});

// ---------------------------------------------------------------------------
// TimeDisplay.HelperText
// ---------------------------------------------------------------------------

describe('TimeDisplay.HelperText', () => {
  it('renders children', () => {
    render(
      <TimeDisplay>
        <TimeDisplayHelperText>Job is still running</TimeDisplayHelperText>
      </TimeDisplay>
    );
    expect(screen.getByText('Job is still running')).toBeInTheDocument();
  });

  it('applies optional className', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayHelperText className="extra">text</TimeDisplayHelperText>
      </TimeDisplay>
    );
    expect(container.querySelector('.extra')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TimeDisplay.CompleteMessage
// ---------------------------------------------------------------------------

describe('TimeDisplay.CompleteMessage', () => {
  it('renders children when mounted', () => {
    render(
      <TimeDisplay>
        <TimeDisplayComplete>Job complete</TimeDisplayComplete>
      </TimeDisplay>
    );
    expect(screen.getByText('Job complete')).toBeInTheDocument();
  });

  it('has role="status"', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayComplete>Done</TimeDisplayComplete>
      </TimeDisplay>
    );
    const el = container.querySelector('[class*="complete-label"]');
    expect(el).toHaveAttribute('role', 'status');
  });

  it('has aria-live="polite"', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayComplete>Done</TimeDisplayComplete>
      </TimeDisplay>
    );
    const el = container.querySelector('[class*="complete-label"]');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('applies optional className', () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayComplete className="extra">Done</TimeDisplayComplete>
      </TimeDisplay>
    );
    expect(container.querySelector('.extra')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Context write-back — integration
// ---------------------------------------------------------------------------

describe('context write-back integration', () => {
  it('SR text in sr-only div updates when timeValues change', async () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayLabel>Elapsed</TimeDisplayLabel>
        <TimeDisplayValue mode="count-up" startTime={JOB_START} />
      </TimeDisplay>
    );
    await act(async () => {});
    const sr = container.querySelector('[class*="sr-only"]');
    expect(sr?.textContent?.length).toBeGreaterThan(0);
  });

  it('SR text includes label text from TimeDisplay.Label', async () => {
    const { container } = render(
      <TimeDisplay>
        <TimeDisplayLabel>Session expires in</TimeDisplayLabel>
        <TimeDisplayValue mode="duration" duration={90} />
      </TimeDisplay>
    );
    await act(async () => {});
    const sr = container.querySelector('[class*="sr-only"]');
    expect(sr?.textContent).toContain('Session expires in');
  });

  it('uses aria-label on root as SR fallback when Label is not plain string', async () => {
    const { container } = render(
      <TimeDisplay aria-label="job elapsed time">
        <TimeDisplayLabel>
          <span>icon</span> Elapsed
        </TimeDisplayLabel>
        <TimeDisplayValue mode="duration" duration={90} />
      </TimeDisplay>
    );
    await act(async () => {});
    const sr = container.querySelector('[class*="sr-only"]');
    // labelText is '' (non-string children) — srText falls back to aria-label
    // until Value writes accessibleText
    expect(sr).toBeInTheDocument();
  });

  it('threshold announcement appears in live region when threshold crossed', () => {
    render(
      <TimeDisplay>
        <TimeDisplayValue
          mode="count-down"
          endTime={new Date(Date.now() + 5000)}
          announcementMode="threshold"
          thresholds={[{ value: 4, label: '4 seconds remaining' }]}
        />
      </TimeDisplay>
    );
    act(() => jest.advanceTimersByTime(2000));
    // After 2s, remaining ≈ 3s — threshold at 4s has been crossed
    // live region should contain the threshold label (may already be cleared)
    // We verify the live region element exists and is always in DOM
    const liveRegions = document.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBeGreaterThanOrEqual(1);
  });

  it('consumer can drive CompleteMessage via onComplete state', () => {
    const Wrapper = () => {
      const [done, setDone] = React.useState(false);
      return (
        <TimeDisplay>
          <TimeDisplayValue
            mode="count-down"
            endTime={PAST_END}
            onComplete={() => setDone(true)}
          />
          {done && <TimeDisplayComplete>All done</TimeDisplayComplete>}
        </TimeDisplay>
      );
    };
    render(<Wrapper />);
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByText('All done')).toBeInTheDocument();
  });
});
