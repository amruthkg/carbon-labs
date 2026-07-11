/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Main component (sub-components accessible as TimeDisplay.Label etc.)
export { TimeDisplay } from './components/TimeDisplay';

// Sub-components (also accessible as static properties on TimeDisplay)
export { TimeDisplayLabel } from './components/TimeDisplayLabel';
export { TimeDisplayValue } from './components/TimeDisplayValue';
export { TimeDisplayHelperText } from './components/TimeDisplayHelperText';
export { TimeDisplayComplete } from './components/TimeDisplayComplete';

// Public types
export type {
  TimeDisplayProps,
  TimeLabelProps,
  TimeValueProps,
  TimeHelperTextProps,
  TimeCompleteMessageProps,
  TimeDisplayMode,
  TimeDisplayFormat,
  TimeUnit,
  AnnouncementMode,
  TimeThreshold,
  TimeValues,
} from './components/TimeDisplay.types';

// Not exported: useTimeCalculation, TimeDisplayContextValue, any hooks
