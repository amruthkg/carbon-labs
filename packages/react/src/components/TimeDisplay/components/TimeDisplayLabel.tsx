/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { TimeLabelProps } from './TimeDisplay.types';
import { useTimeDisplayContext } from './TimeDisplay';

/**
 * `TimeDisplay.Label` renders the label for the time display.
 *
 * When `children` is a plain string it is automatically registered in context
 * so `TimeDisplay.Value` can include it in the assembled SR text.
 * When `children` contains non-string content (e.g. an icon), pass `aria-label`
 * on the root `<TimeDisplay>` as the SR fallback.
 *
 * ```tsx
 * <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
 * <TimeDisplay.Label hidden>Visually hidden but still announced</TimeDisplay.Label>
 * <TimeDisplay.Label inline>Beside the value</TimeDisplay.Label>
 * ```
 */
export const TimeDisplayLabel: React.FC<TimeLabelProps> = ({
  hidden = false,
  inline = false,
  children,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--time-display`;
  const { setLabelText } = useTimeDisplayContext();

  // Register the plain-string label text into context so TimeDisplayValue can
  // assemble SR text without needing direct access to the label prop.
  // dep-array is mandatory — no dep array causes an infinite loop (L2).
  useEffect(() => {
    const text = typeof children === 'string' ? children : '';
    setLabelText(text);
  }, [children, setLabelText]);

  return (
    <span
      className={[
        `${blockClass}__label`,
        hidden && `${blockClass}__label--hidden`,
        inline && `${blockClass}__label--inline`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
};

TimeDisplayLabel.displayName = 'TimeDisplayLabel';
