/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { TimeCompleteMessageProps } from './TimeDisplay.types';

/**
 * `TimeDisplay.CompleteMessage` renders a completion message when a countdown
 * reaches zero.
 *
 * Pure renderer — no context interaction, no `isComplete` gate (D11, L5).
 * The consumer controls visibility by mounting this component conditionally.
 *
 * ```tsx
 * const [isComplete, setIsComplete] = useState(false);
 *
 * <TimeDisplay.Value
 *   mode="count-down"
 *   endTime={deadline}
 *   onComplete={() => setIsComplete(true)}
 * />
 * {isComplete && (
 *   <TimeDisplay.CompleteMessage>Job complete</TimeDisplay.CompleteMessage>
 * )}
 * ```
 */
export const TimeDisplayComplete: React.FC<TimeCompleteMessageProps> = ({
  children,
  className,
}) => {
  const prefix = usePrefix();
  return (
    <div
      className={[`${prefix}--time-display__complete-label`, className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
};

TimeDisplayComplete.displayName = 'TimeDisplayComplete';
