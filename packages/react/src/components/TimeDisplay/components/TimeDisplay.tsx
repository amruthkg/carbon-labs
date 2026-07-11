/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type {
  TimeDisplayProps,
  TimeLabelProps,
  TimeValueProps,
  TimeHelperTextProps,
  TimeCompleteMessageProps,
} from './TimeDisplay.types';
import { TimeDisplayLabel } from './TimeDisplayLabel';
import { TimeDisplayValue } from './TimeDisplayValue';
import { TimeDisplayHelperText } from './TimeDisplayHelperText';
import { TimeDisplayComplete } from './TimeDisplayComplete';

// ---------------------------------------------------------------------------
// Context — internal, not exported
// ---------------------------------------------------------------------------

interface TimeDisplayContextValue {
  /** Assembled SR text — written by TimeDisplayValue, read by root sr-only div */
  accessibleText: string;
  setAccessibleText: (text: string) => void;
  /** Threshold announcement text — written by TimeDisplayValue, read by root live region */
  announcementText: string | null;
  setAnnouncementText: (text: string | null) => void;
  /** Plain-string label text — written by TimeDisplayLabel, read by TimeDisplayValue for SR assembly */
  labelText: string;
  setLabelText: (text: string) => void;
  /** Whether animations are enabled — read by TimeDisplayValue to pass to AnimatedNumber */
  animated: boolean;
}

const TimeDisplayContext = createContext<TimeDisplayContextValue>({
  accessibleText: '',
  setAccessibleText: () => {},
  announcementText: null,
  setAnnouncementText: () => {},
  labelText: '',
  setLabelText: () => {},
  animated: true,
});

/**
 * Read the TimeDisplay context.
 * @internal — not exported from index.ts
 */
export function useTimeDisplayContext(): TimeDisplayContextValue {
  return useContext(TimeDisplayContext);
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

/**
 * `TimeDisplay` is the composable root component.
 *
 * It provides the shared context for all sub-components, renders the
 * visually-hidden SR text region and the threshold `aria-live` region,
 * and applies the `--animated` CSS modifier.
 *
 * ```tsx
 * <TimeDisplay animated>
 *   <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
 *   <TimeDisplay.Value mode="count-up" startTime={start} format="stacked" />
 *   <TimeDisplay.HelperText>Job is still running</TimeDisplay.HelperText>
 * </TimeDisplay>
 * ```
 */
export const TimeDisplay: React.FC<TimeDisplayProps> & {
  Label: React.FC<TimeLabelProps>;
  Value: React.FC<TimeValueProps>;
  HelperText: React.FC<TimeHelperTextProps>;
  CompleteMessage: React.FC<TimeCompleteMessageProps>;
} = ({
  animated = true,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  children,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--time-display`;

  const [accessibleText, setAccessibleText] = useState('');
  const [announcementText, setAnnouncementText] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');

  // Memoize the context value object so consumers only re-render when something
  // actually changes. An inline object literal creates a new reference every
  // render, causing every context consumer to re-render every tick (L8).
  const contextValue = useMemo(
    () => ({
      accessibleText,
      setAccessibleText,
      announcementText,
      setAnnouncementText,
      labelText,
      setLabelText,
      animated,
    }),
    // useState setters are stable — safe to omit from deps
    [accessibleText, announcementText, labelText, animated] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // aria-label is the fallback when TimeDisplay.Label children is not a plain
  // string (e.g. contains icons). When both are available, accessibleText
  // (assembled by TimeDisplayValue from labelText + time values) takes priority.
  const srText = accessibleText || ariaLabel || '';

  // Development-only warning when no accessible label is available.
  if (process.env.NODE_ENV !== 'production' && !srText) {
    console.warn(
      'TimeDisplay: No accessible label available. ' +
        'Use a plain string in TimeDisplay.Label, or pass aria-label on TimeDisplay.'
    );
  }

  return (
    <TimeDisplayContext.Provider value={contextValue}>
      <div
        className={[
          blockClass,
          animated && `${blockClass}--animated`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={dataTestId}
      >
        {/* aria-live="off" is intentional — SR reads the value when focused,
            not on every 1-second tick. */}
        <div
          className={`${blockClass}__sr-only`}
          role="status"
          aria-live="off"
        >
          {srText}
        </div>

        {/* Always in the DOM — SR registers live regions on mount, not on
            conditional appearance. Content cleared to null after 100ms so the
            same text can re-announce if thresholds are reset. */}
        <div
          className={`${blockClass}__live-region`}
          role="status"
          aria-live="polite"
        >
          {announcementText}
        </div>

        {children}
      </div>
    </TimeDisplayContext.Provider>
  );
};

TimeDisplay.displayName = 'TimeDisplay';

TimeDisplay.Label = TimeDisplayLabel;
TimeDisplay.Value = TimeDisplayValue;
TimeDisplay.HelperText = TimeDisplayHelperText;
TimeDisplay.CompleteMessage = TimeDisplayComplete;

export default TimeDisplay;
