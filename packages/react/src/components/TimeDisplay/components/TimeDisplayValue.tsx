/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { TimeValueProps, TimeUnit } from './TimeDisplay.types';
import { useTimeDisplayContext } from './TimeDisplay';
import { useTimeCalculation } from '../hooks/useTimeCalculation';
import { AnimatedNumber } from './AnimatedNumber';
import {
  formatTimeValue,
  filterTimeUnits,
  generateAccessibleText,
  validateTimeDisplayProps,
  warnOnSuspiciousProps,
} from '../utils/timeUtils';

// ---------------------------------------------------------------------------
// Unit label helpers (local — not re-exported)
// ---------------------------------------------------------------------------

const UNIT_SHORT: Record<TimeUnit, { singular: string; plural: string }> = {
  days: { singular: 'day', plural: 'days' },
  hours: { singular: 'hr', plural: 'hr' },
  minutes: { singular: 'min', plural: 'min' },
  seconds: { singular: 'sec', plural: 'sec' },
};

function getVisualLabel(
  unit: TimeUnit,
  value: number,
  unitLabels?: Partial<Record<TimeUnit, string>>
): string {
  if (unitLabels?.[unit] != null) {
    return unitLabels[unit] as string;
  }
  const labels = UNIT_SHORT[unit];
  return value === 1 ? labels.singular : labels.plural;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `TimeDisplay.Value` renders the numeric time value in one of four visual
 * formats. It owns the internal timer, validation, SR text assembly, and
 * threshold announcement write-back.
 *
 * `mode` is required. There is no `timeValues` escape-hatch prop — the
 * component always owns the timer (decision D4, D6).
 *
 * ```tsx
 * <TimeDisplay.Value
 *   mode="count-up"
 *   startTime={jobStart}
 *   format="stacked"
 *   units={['hours', 'minutes', 'seconds']}
 * />
 * ```
 */
export const TimeDisplayValue: React.FC<TimeValueProps> = ({
  mode,
  startTime,
  endTime,
  duration,
  thresholds = [],
  onComplete,
  announcementMode = 'off',
  format = 'stacked',
  units = ['hours', 'minutes', 'seconds'],
  padWithZero = true,
  keepZeroValueUnits = true,
  separator = ':',
  unitLabels,
  accessibleUnitLabels,
  className,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--time-display`;

  const { labelText, setAccessibleText, setAnnouncementText, animated } =
    useTimeDisplayContext();

  // Direction is determined by mode, not by comparing field values.
  // Field-value comparison cannot handle wrap boundaries correctly:
  //   count-up:   59→00 looks like a decrease but must animate 'up'  (odometer wrap)
  //   count-down: 00→59 looks like an increase but must animate 'down'
  // duration is static — direction is irrelevant but we default to 'up'.
  const animationDirection: 'up' | 'down' = mode === 'count-down' ? 'down' : 'up';

  // ── Step 1: Normalise time inputs to stable ms primitives ─────────────────
  // Must happen before the hook call so dep comparison works by value.
  const startTimeMs =
    startTime != null ? new Date(startTime).getTime() : undefined;
  const endTimeMs = endTime != null ? new Date(endTime).getTime() : undefined;

  // ── Step 2: Hook — UNCONDITIONAL, before any conditional return (L6) ──────
  const internalResult = useTimeCalculation({
    mode,
    startTime: startTimeMs,
    endTime: endTimeMs,
    duration: duration ?? 0,
    onComplete,
    thresholds,
    announceThresholds: announcementMode === 'threshold',
  });

  const { timeValues } = internalResult;

  // ── Step 3: Validation — after hook, return null on failure ───────────────
  const validation = validateTimeDisplayProps(
    mode,
    startTime,
    endTime,
    duration,
    units
  );
  if (!validation.valid) {
    // eslint-disable-next-line no-console
    console.error(`TimeDisplay: ${validation.error}`);
    return null;
  }

  warnOnSuspiciousProps({
    mode,
    startTime,
    endTime,
    duration,
    units,
    format,
    announcementMode,
    thresholds,
    onComplete,
  });

  // ── Step 4: Derived display data ──────────────────────────────────────────

  // Memoize on primitive fields of timeValues, not the object reference.
  // timeValues is a new object every tick; depending on the reference would
  // invalidate srText every tick regardless of whether values changed (L2/fix3).
  const displayUnits = useMemo(
    () => filterTimeUnits(timeValues, units, keepZeroValueUnits),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      timeValues.days,
      timeValues.hours,
      timeValues.minutes,
      timeValues.seconds,
      // units is typically a literal — JSON.stringify gives stable comparison
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(units),
      keepZeroValueUnits,
    ]
  );

  // Assemble SR text via useMemo — never via a no-dep-array useEffect.
  // Deriving here prevents the setAccessibleText → root re-render →
  // Value re-render → setAccessibleText infinite loop (L2).
  const srText = useMemo(
    () =>
      generateAccessibleText(
        labelText,
        timeValues,
        units,
        keepZeroValueUnits,
        accessibleUnitLabels,
        unitLabels
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      displayUnits,
      labelText,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(accessibleUnitLabels),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(unitLabels),
    ]
  );

  // Push SR text to root — dep-array is mandatory (L2).
  useEffect(() => {
    setAccessibleText(srText);
  }, [srText, setAccessibleText]);

  // Push threshold announcement text to root live region.
  // Clear after 100ms so the same text can re-announce if thresholds are reset.
  useEffect(() => {
    if (internalResult.announcementText) {
      setAnnouncementText(internalResult.announcementText);
      const timer = setTimeout(() => setAnnouncementText(null), 100);
      return () => clearTimeout(timer);
    }
  }, [internalResult.announcementText, setAnnouncementText]);

  // ── Step 5: Format renderers ───────────────────────────────────────────────

  // `stacked` prop value maps to `split` CSS class prefix (D7 — avoid CSS churn)
  const renderStacked = () => (
    // dir="ltr" freezes unit sequence order (hr→min→sec) in RTL layouts (RTL Level 1)
    <div className={`${blockClass}__split-container`} dir="ltr">
      {displayUnits.map(({ unit, value }, index) => (
        <div
          key={unit}
          className={[
            `${blockClass}__split-unit`,
            index === 0 && `${blockClass}__split-unit--first`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={`${blockClass}__split-value-wrapper`}>
            <div className={`${blockClass}__split-value`}>
              <AnimatedNumber
                value={formatTimeValue(value, padWithZero)}
                animated={animated}
                direction={animationDirection}
              />
            </div>
            <div className={`${blockClass}__split-label`}>
              {getVisualLabel(unit, value, unitLabels)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBoxed = () => (
    // dir="ltr" freezes unit sequence order in RTL layouts (RTL Level 1)
    <div className={`${blockClass}__boxed-container`} dir="ltr">
      {displayUnits.map(({ unit, value }) => (
        <div key={unit} className={`${blockClass}__boxed-unit`}>
          <div className={`${blockClass}__boxed-value`}>
            <AnimatedNumber
              value={formatTimeValue(value, padWithZero)}
              animated={animated}
              direction={animationDirection}
            />
          </div>
          <div className={`${blockClass}__boxed-label`}>
            {getVisualLabel(unit, value, unitLabels)}
          </div>
        </div>
      ))}
    </div>
  );

  // flat format: per-unit AnimatedNumber with aria-hidden separator spans.
  // Do NOT pass a composite joined string to one AnimatedNumber — carry-wrap
  // direction would break across the separator boundary (L7).
  // Separator is visual-only; SR text never contains it (Rule 3).
  const renderFlat = () => (
    // dir="ltr" freezes unit sequence order in RTL layouts (RTL Level 1)
    <div className={`${blockClass}__flat-container`} dir="ltr">
      {displayUnits.map(({ unit, value }, index) => (
        <React.Fragment key={unit}>
          <span className={`${blockClass}__flat-value`}>
            <AnimatedNumber
              value={formatTimeValue(value, padWithZero)}
              animated={animated}
              direction={animationDirection}
            />
          </span>
          {index < displayUnits.length - 1 && (
            <span
              className={`${blockClass}__flat-separator`}
              aria-hidden="true"
            >
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderInline = () => (
    // dir="ltr" freezes unit sequence order in RTL layouts (RTL Level 1)
    <div className={`${blockClass}__inline-container`} dir="ltr">
      {displayUnits.map(({ unit, value }) => (
        <React.Fragment key={unit}>
          <span className={`${blockClass}__inline-value`}>
            <AnimatedNumber
              value={formatTimeValue(value, padWithZero)}
              animated={animated}
              direction={animationDirection}
            />
          </span>
          <span className={`${blockClass}__inline-unit`}>
            {getVisualLabel(unit, value, unitLabels)}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  // ── Step 6: Dispatch ───────────────────────────────────────────────────────

  // No wrapper div, no --animated class here (L4).
  // The --animated modifier lives on the root <TimeDisplay> div only.
  const renderFormat = () => {
    switch (format) {
      case 'boxed':
        return renderBoxed();
      case 'flat':
        return renderFlat();
      case 'inline':
        return renderInline();
      case 'stacked':
      default:
        return renderStacked();
    }
  };

  return (
    <div className={className || undefined}>{renderFormat()}</div>
  );
};

TimeDisplayValue.displayName = 'TimeDisplayValue';
