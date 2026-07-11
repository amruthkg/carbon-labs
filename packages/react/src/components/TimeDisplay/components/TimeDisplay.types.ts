/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Primitive union types
// ---------------------------------------------------------------------------

/**
 * Visual format for displaying the time value.
 * `stacked` and `boxed` show each unit with a label below.
 * `flat` renders a compact separator-delimited string (e.g. 01:23:45).
 * `inline` renders each unit with its label in a flowing line.
 */
export type TimeDisplayFormat = 'stacked' | 'boxed' | 'flat' | 'inline';

/**
 * How the time value is calculated and displayed.
 * - `count-up`: elapsed time from `startTime`
 * - `count-down`: remaining time until `endTime`
 * - `duration`: fixed value in seconds
 */
export type TimeDisplayMode = 'count-up' | 'count-down' | 'duration';

/**
 * Supported time units.
 */
export type TimeUnit = 'days' | 'hours' | 'minutes' | 'seconds';

/**
 * Accessibility announcement mode.
 * `off` — no live-region announcements.
 * `threshold` — threshold labels are injected into the aria-live region.
 */
export type AnnouncementMode = 'off' | 'threshold';

// ---------------------------------------------------------------------------
// Structured types
// ---------------------------------------------------------------------------

/**
 * Calculated time values broken down by unit.
 */
export interface TimeValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * A single threshold configuration.
 * Thresholds only fire in `count-down` mode.
 */
export interface TimeThreshold {
  /** Remaining seconds at which this threshold fires */
  value: number;
  /** Text announced to screen readers when this threshold is crossed */
  label: string;
  /**
   * Optional callback fired once when this threshold is crossed.
   * Fires regardless of `announcementMode`.
   */
  onReach?: (value: number) => void;
}

// ---------------------------------------------------------------------------
// Component prop interfaces
// ---------------------------------------------------------------------------

/**
 * Props for the root `<TimeDisplay>` component.
 * The root is layout/a11y only — it owns no timer logic.
 */
export interface TimeDisplayProps {
  /**
   * Enable Carbon productive-motion digit animations.
   * Applied as a CSS modifier on the root element; all sub-components inherit.
   * Automatically suppressed by `prefers-reduced-motion` CSS.
   * @default true
   */
  animated?: boolean;
  /** Additional CSS class applied to the root element */
  className?: string;
  /**
   * Accessible label for the entire component.
   * Used as the SR text fallback when `TimeDisplay.Label` children is not a
   * plain string (e.g. contains icons). Not needed when `TimeDisplay.Label`
   * children is a plain string.
   */
  'aria-label'?: string;
  /** Test ID forwarded to the root element */
  'data-testid'?: string;
  children: ReactNode;
}

/**
 * Props for `TimeDisplay.Label`.
 */
export interface TimeLabelProps {
  /**
   * Hide the label visually.
   * Uses Carbon visually-hidden utility — label stays in the accessibility tree.
   * @default false
   */
  hidden?: boolean;
  /**
   * Render the label inline (beside the value) rather than as a block above it.
   * @default false
   */
  inline?: boolean;
  /** Label content. Plain string preferred for automatic SR text assembly. */
  children: ReactNode;
}

/**
 * Props for `TimeDisplay.Value`.
 * This sub-component always owns the internal timer.
 * There is no `timeValues` escape-hatch prop.
 */
export interface TimeValueProps {
  /**
   * How the time value is calculated.
   * - `count-up`: elapsed time from `startTime`
   * - `count-down`: remaining time until `endTime`
   * - `duration`: fixed value in seconds
   */
  mode: TimeDisplayMode;
  /** Start time for count-up. Accepts `Date`, ms timestamp (13 digits), or ISO string. */
  startTime?: Date | number | string;
  /** End time for count-down. Accepts `Date`, ms timestamp (13 digits), or ISO string. */
  endTime?: Date | number | string;
  /** Fixed duration in seconds for `duration` mode. */
  duration?: number;
  /** Threshold configurations. Only fire in `count-down` mode. */
  thresholds?: TimeThreshold[];
  /** Callback fired once when `count-down` reaches zero. */
  onComplete?: () => void;
  /**
   * Controls whether threshold labels populate the `aria-live` region.
   * @default 'off'
   */
  announcementMode?: AnnouncementMode;
  /**
   * Visual format.
   * @default 'stacked'
   */
  format?: TimeDisplayFormat;
  /**
   * Which units to render.
   * @default ['hours', 'minutes', 'seconds']
   */
  units?: TimeUnit[];
  /**
   * Pad single-digit values with a leading zero.
   * @default true
   */
  padWithZero?: boolean;
  /**
   * Show units even when their value is zero.
   * @default true
   */
  keepZeroValueUnits?: boolean;
  /**
   * Separator character for `flat` format only.
   * Ignored silently for other formats.
   * @default ':'
   */
  separator?: string;
  /**
   * Override visible unit label strings.
   * Unspecified units use built-in short labels.
   */
  unitLabels?: Partial<Record<TimeUnit, string>>;
  /**
   * Override SR-only unit label strings independently of visible labels.
   * Lookup order: `accessibleUnitLabels[unit]` → `unitLabels[unit]` → built-in full labels.
   */
  accessibleUnitLabels?: Partial<Record<TimeUnit, string>>;
  /** Additional CSS class applied to the value container */
  className?: string;
}

/**
 * Props for `TimeDisplay.HelperText`.
 */
export interface TimeHelperTextProps {
  children: ReactNode;
  /** Additional CSS class applied to the helper text element */
  className?: string;
}

/**
 * Props for `TimeDisplay.CompleteMessage`.
 */
export interface TimeCompleteMessageProps {
  children: ReactNode;
  /** Additional CSS class applied to the complete message element */
  className?: string;
}
