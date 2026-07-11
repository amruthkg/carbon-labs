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
import type { TimeHelperTextProps } from './TimeDisplay.types';

/**
 * `TimeDisplay.HelperText` renders supplementary text below the time value.
 *
 * Pure renderer — no context interaction.
 *
 * ```tsx
 * <TimeDisplay.HelperText>Job is still running</TimeDisplay.HelperText>
 * ```
 */
export const TimeDisplayHelperText: React.FC<TimeHelperTextProps> = ({
  children,
  className,
}) => {
  const prefix = usePrefix();
  return (
    <div
      className={[`${prefix}--time-display__helper-text`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

TimeDisplayHelperText.displayName = 'TimeDisplayHelperText';
